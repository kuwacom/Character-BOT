import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from peft import PeftModel
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables.base import RunnableSequence, RunnableMap
from langchain_huggingface.llms import HuggingFacePipeline
from langchain_core.callbacks import StreamingStdOutCallbackHandler

import sys
import time
import os

# モデルとトークナイザーのロード
# modelName = "./models/Llama-3-ELYZA-JP-8B"
modelName = "./models/Llama-3-8b-Cosmopedia-japanese"
loraModelName = "./loras/256-daisuki-mini"
offloadDir = "./offload"
useLoRA = True  # LoRA を使用するかどうかのフラグ

# オフロードディレクトリの作成
os.makedirs(offloadDir, exist_ok=True)

tokenizer = AutoTokenizer.from_pretrained(modelName)

# ベースモデルのロード
baseModel = AutoModelForCausalLM.from_pretrained(
    modelName,
    device_map="auto",
    # device_map={"": 'cuda:0'}, # cudaでの実行を指定(VRAM多くないと無理)
    offload_folder=offloadDir,
    torch_dtype=torch.float16,  # メモリ使用量を減らすために float16 を使用
    low_cpu_mem_usage=True      # CPU メモリの使用を抑えるオプション
)

# LoRA モデルの条件付きロード
if useLoRA:
    loraModel = PeftModel.from_pretrained(baseModel, loraModelName)
    model = loraModel
else:
    model = baseModel

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# model.to(device)

pipe = pipeline(
    "text-generation", # タスクの指定
    model=model, # モデルをセット
    tokenizer=tokenizer, # トークナイザーをセット
    # max_new_tokens=64 # 生成するトークンの最大数
)

# LangChain のプロンプトテンプレート
promptTemplate = PromptTemplate(
    template="""あなたは親切で知識豊富なアシスタントです。
以下は会話の履歴です。
{history}
ユーザー: {userInput}
ボット:""",
    input_variables=["history", "userInput"]
)

#  LangChain の LLMChain
# llmChain = LLMChain(
#     prompt_template=promptTemplate,
#     llm=model,
#     tokenizer=tokenizer,
#     device=device
# )
# # RunnableSequence を使ってチェインを定義
# llmChain = RunnableSequence(
#     steps=[promptTemplate | model],
#     tokenizer=tokenizer
# )
# # RunnableMap を使ってプロンプトとモデルをチェインする
# llmChain = RunnableMap({
#     "prompt": promptTemplate,
#     "model": model
# })

llmChain = HuggingFacePipeline(pipeline=pipe)


# チャットの履歴
history = []

def generateResponse(userInput):
    global history
    historyText = "\n".join([f"{role}: {message}" for role, message in history])
    result = llmChain(
        history=historyText,
        userInput=userInput,
        # callbacks=[RealTimeCallback()]]
        callbacks=[StreamingStdOutCallbackHandler()]
    )
    response = result["text"]
    return response

def main():
    print("チャットボットへようこそ！終了するには 'exit' と入力してください。")

    while True:
        userInput = input("あなた: ")
        if userInput.lower() == 'exit':
            break
        
        # レスポンス生成
        response = generateResponse(userInput)
        
        # 履歴の更新
        history.append(("ユーザー", userInput))
        history.append(("ボット", response.strip()))
        
        # リアルタイムで出力
        print("ボット: ", end="")
        print(response.strip())
        print()

if __name__ == "__main__":
    main()

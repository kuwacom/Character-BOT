import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from peft import PeftModel
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables.base import RunnableSequence, RunnableMap
from langchain.memory import ChatMessageHistory
from langchain_huggingface.llms import HuggingFacePipeline
from langchain_core.callbacks import StreamingStdOutCallbackHandler
from langchain.chains.llm import LLMChain

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


llmChain = HuggingFacePipeline(pipeline=pipe)

def setCharacterSettings(characterSettings):
    return PromptTemplate(
        template=f"""{characterSettings}
以下は会話の履歴です。
{{history}}
ユーザー: {{userInput}}
ボット:""",
        input_variables=["history", "userInput"]
    )

def generateResponse(llmChain, promptTemplate, chatHistory, userInput):
    # for msg in chatHistory.messages:
    #     if isinstance(msg, HumanMessage):
    #         # ユーザーのメッセージの場合
    #         history_lines.append(f"ユーザー: {msg.content}")
    #     elif isinstance(msg, AIMessage):
    #         # ボットのメッセージの場合
    #         history_lines.append(f"ボット: {msg.content}")
    history_text = "\n".join([f"ユーザー: {msg.content}" if msg.__class__.__name__ == 'HumanMessage' else f"ボット: {msg.content}" for msg in chatHistory.messages])
    print(history_text)
    # prompt = promptTemplate.format(history=history_text, userInput=userInput)
    response = llmChain.invoke(userInput)
    # response = LLMChain(
    #     llm=llmChain, prompt=promptTemplate,
    #     callbacks=[StreamingStdOutCallbackHandler()]
    # ).invoke(
    #     input=userInput
    # )

    chatHistory.add_user_message(userInput)
    chatHistory.add_ai_message(response)
    return response

def main():
    characterSettings = "あなたは親切で知識豊富なアシスタントです。"
    promptTemplate = setCharacterSettings(characterSettings)
    chatHistory = ChatMessageHistory()

    print("チャットを開始します。'exit'と入力すると終了します。")
    while True:
        userInput = input("ユーザー: ")
        if userInput.lower() == 'exit':
            break

        response = generateResponse(llmChain, promptTemplate, chatHistory, userInput)
        print(f"ボット: {response}")

if __name__ == "__main__":
    main()
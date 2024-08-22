import json
import re

def containsJapanese(text):
    # 日本語を含むかどうかを判定する正規表現
    return bool(re.search(r'[ぁ-んァ-ン一-龯]', text))

def cleanText(text):
    # URLを削除
    text = re.sub(r'http[s]?://\S+', '', text)
    # 7桁以上の数字を削除
    text = re.sub(r'\b\d{7,}\b', '', text)
    # 不要な空白を削除
    text = text.strip()
    return text

def shouldIncludeContent(text):
    # テキストに ``` または \n を含むかどうかをチェック
    return not ('```' in text or '\n' in text)

def extractAndSaveJsonContents(inputFile, outputFile):
    # JSONファイルを読み込む
    with open(inputFile, 'r', encoding='utf-8') as infile:
        data = json.load(infile)

    japaneseContents = []

    # データをループして処理
    for entry in data:
        contents = entry['Contents']
        
        # 日本語を含むかチェック
        if containsJapanese(contents):
            # テキストをクリーンアップ
            cleanedContents = cleanText(contents)
            
            # 特定の文字列を含まないかチェック
            if shouldIncludeContent(cleanedContents):
                # 空でない場合のみ追加
                if cleanedContents:
                    japaneseContents.append(cleanedContents)

    # 抽出した内容をテキストファイルに保存
    with open(outputFile, 'w', encoding='utf-8') as outfile:
        for content in japaneseContents:
            outfile.write(content + '\n')

# 使用例
inputFile = './256-daisuki/messages(3).json'
outputFile = 'output.txt'
extractAndSaveJsonContents(inputFile, outputFile)

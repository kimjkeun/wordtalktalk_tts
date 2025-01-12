import os
from pathlib import Path
import json

def rename_audio_files(base_dir):
    """
    기존 오디오 파일들의 이름을 새로운 네이밍 규칙에 맞게 변경
    새 형식: {word}_{lang}_{type}_{speaker}.mp3
    """
    base_dir = Path(base_dir)
    
    # 각 단어 디렉토리 처리
    for word_dir in base_dir.iterdir():
        if not word_dir.is_dir():
            continue
            
        word = word_dir.name
        print(f"Processing directory: {word}")
        
        # 해당 디렉토리의 모든 mp3 파일 처리
        for audio_file in word_dir.glob("*.mp3"):
            old_name = audio_file.name
            
            # 기존 파일명 패턴 분석
            if old_name.endswith("_kr.mp3"):
                new_name = f"{word}_kr_trans_nara.mp3"
            elif "_matt" in old_name:
                new_name = f"{word}_en_word_matt.mp3"
            elif "_danna" in old_name:
                new_name = f"{word}_en_word_danna.mp3"
            elif "_clara" in old_name:
                new_name = f"{word}_en_word_clara.mp3"
            else:
                print(f"Skipping unknown file pattern: {old_name}")
                continue
            
            # 파일 이름 변경
            old_path = word_dir / old_name
            new_path = word_dir / new_name
            
            try:
                old_path.rename(new_path)
                print(f"Renamed: {old_name} -> {new_name}")
            except Exception as e:
                print(f"Error renaming {old_name}: {str(e)}")

    # metadata.json 파일 업데이트
    metadata_file = base_dir / "metadata.json"
    if metadata_file.exists():
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # 각 항목의 오디오 파일 경로 업데이트
        for item in metadata["vocabulary_items"]:
            word = item["word"]["text"]
            
            # 영어 발음 파일 경로 업데이트
            new_audio = {}
            for speaker in ["matt", "danna", "clara"]:
                new_audio[speaker] = str(Path(word) / f"{word}_en_word_{speaker}.mp3")
            item["word"]["audio"] = new_audio
            
            # 한국어 발음 파일 경로 업데이트
            if item["word"]["translation"]["audio"]:
                item["word"]["translation"]["audio"] = str(Path(word) / f"{word}_kr_trans_nara.mp3")
        
        # 업데이트된 metadata 저장
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        print("Updated metadata.json")

if __name__ == "__main__":
    # part1 디렉토리의 파일들 처리
    audio_dir = Path(__file__).parent.parent / "data" / "audio" / "part1"
    rename_audio_files(audio_dir)

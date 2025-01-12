import os
import json
import pandas as pd
from pathlib import Path

def prepare_vocabulary_data():
    # Project root directory
    root_dir = Path(__file__).parent.parent
    
    # Input directories
    vocab_dir = root_dir / "data" / "vocabulary_parts"
    audio_dir = root_dir / "data" / "audio"
    
    # Output directory
    frontend_data_dir = root_dir / "frontend" / "public" / "data"
    frontend_audio_dir = frontend_data_dir / "audio"
    
    # Create output directories if they don't exist
    frontend_data_dir.mkdir(parents=True, exist_ok=True)
    frontend_audio_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize vocabulary data structure
    vocabulary_data = {
        "parts": []
    }
    
    # Process each vocabulary part
    for vocab_file in sorted(vocab_dir.glob("vocabulary_part*.csv")):
        part_num = int(vocab_file.stem.split('part')[-1])
        print(f"Processing part {part_num}...")
        
        # Read CSV file
        df = pd.read_csv(vocab_file)
        
        part_data = {
            "id": part_num,
            "name": f"Part {part_num}",
            "words": []
        }
        
        # Process each word
        for _, row in df.iterrows():
            word = row['Word'].strip()
            translation = row['Korean Translation'].strip()
            
            # Check for audio files
            word_dir = audio_dir / f"part{part_num}" / word
            
            audio_files = {
                "en": {},
                "kr": None
            }
            
            if word_dir.exists():
                # English audio files
                for voice in ["matt", "danna", "clara"]:
                    en_file = word_dir / f"{word}_en_word_{voice}.mp3"
                    if en_file.exists():
                        # Copy file to frontend directory
                        target_path = frontend_audio_dir / en_file.name
                        if not target_path.exists():
                            with open(en_file, 'rb') as src, open(target_path, 'wb') as dst:
                                dst.write(src.read())
                        audio_files["en"][voice] = f"/data/audio/{en_file.name}"
                
                # Korean audio file
                kr_file = word_dir / f"{word}_kr_trans_nara.mp3"
                if kr_file.exists():
                    target_path = frontend_audio_dir / kr_file.name
                    if not target_path.exists():
                        with open(kr_file, 'rb') as src, open(target_path, 'wb') as dst:
                            dst.write(src.read())
                    audio_files["kr"] = f"/data/audio/{kr_file.name}"
            
            # Add word data
            part_data["words"].append({
                "word": word,
                "translation": translation,
                "audioFiles": audio_files
            })
        
        vocabulary_data["parts"].append(part_data)
    
    # Save vocabulary data as JSON
    with open(frontend_data_dir / "vocabulary.json", 'w', encoding='utf-8') as f:
        json.dump(vocabulary_data, f, ensure_ascii=False, indent=2)
    
    print("\nData preparation completed!")
    print(f"Vocabulary data saved to: {frontend_data_dir / 'vocabulary.json'}")
    print(f"Audio files copied to: {frontend_audio_dir}")

if __name__ == "__main__":
    prepare_vocabulary_data()

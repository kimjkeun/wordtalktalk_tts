import os
import json
from pathlib import Path
import pandas as pd
import requests
from openai import OpenAI
from tqdm import tqdm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TTSGenerator:
    def __init__(self, config_path):
        """Initialize TTS Generator with configuration."""
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Initialize Clova headers
        self.clova_headers = {
            "X-NCP-APIGW-API-KEY-ID": os.getenv('CLOVA_CLIENT_ID'),
            "X-NCP-APIGW-API-KEY": os.getenv('CLOVA_CLIENT_SECRET'),
            "Content-Type": "application/x-www-form-urlencoded"
        }
    
    def generate_clova_tts(self, text, voice_name):
        """Generate TTS using Clova Voice API"""
        url = "https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts"
        
        headers = {
            "X-NCP-APIGW-API-KEY-ID": os.getenv("CLOVA_CLIENT_ID"),
            "X-NCP-APIGW-API-KEY": os.getenv("CLOVA_CLIENT_SECRET"),
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "speaker": voice_name,
            "text": text,
            "format": "mp3",
            "speed": "0"
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            if response.status_code == 200:
                return response.content
            else:
                print(f"Error generating Clova TTS for {text}: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error generating Clova TTS for {text}: {str(e)}")
            return None

    def generate_openai_tts(self, text, voice_config, output_path):
        """Generate TTS audio file using OpenAI API"""
        try:
            response = self.openai_client.audio.speech.create(
                model=voice_config["model"],
                voice=voice_config["voice"],
                input=text
            )
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            response.stream_to_file(str(output_path))
            return True
        except Exception as e:
            print(f"Error generating OpenAI TTS for {text}: {str(e)}")
            return False

    def sanitize_filename(self, text):
        """Sanitize text to be used as filename"""
        return "".join(c for c in text if c.isalnum() or c in (' ', '_')).strip().replace(' ', '_')

    def save_audio(self, audio_data, word, voice_name, output_dir, is_korean=False):
        """Save audio data to a file with the new naming convention"""
        os.makedirs(output_dir, exist_ok=True)
        
        # New naming convention: {word}_{lang}_{type}_{speaker}.mp3
        lang = "kr" if is_korean else "en"
        content_type = "trans" if is_korean else "word"
        filename = f"{word}_{lang}_{content_type}_{voice_name}.mp3"
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "wb") as f:
            f.write(audio_data)
        return filepath

    def process_vocabulary(self, csv_file, output_base_dir):
        """Process vocabulary from CSV file."""
        # Create output directory if it doesn't exist
        output_dir = Path(output_base_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Load or initialize metadata
        metadata_file = output_dir / "metadata.json"
        if metadata_file.exists():
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
        else:
            metadata = {"words": []}
        
        # Keep track of processed words
        processed_words = {item["word"] for item in metadata["words"]}
        
        # Read CSV file
        df = pd.read_csv(csv_file)
        
        # Process each word
        for _, row in tqdm(df.iterrows(), total=len(df), desc=f"Processing {output_dir.name}"):
            word = row['Word'].strip()
            korean = row['Korean Translation'].strip()
            
            # Skip if word has already been processed
            if word in processed_words:
                continue
            
            word_dir = os.path.join(output_dir, word)
            os.makedirs(word_dir, exist_ok=True)
            
            # Generate English audio with multiple voices
            en_audio_paths = {}
            for voice_name in ["matt", "danna", "clara"]:
                audio_data = self.generate_clova_tts(word, voice_name)
                if audio_data:
                    filepath = self.save_audio(audio_data, word, voice_name, word_dir)
                    en_audio_paths[voice_name] = os.path.relpath(filepath, output_dir)
            
            # Generate Korean audio
            kr_audio_path = None
            if korean:
                audio_data = self.generate_clova_tts(korean, "nara")
                if audio_data:
                    filepath = self.save_audio(audio_data, word, "nara", word_dir, is_korean=True)
                    kr_audio_path = os.path.relpath(filepath, output_dir)
            
            # Add to metadata
            metadata["words"].append({
                "word": word,
                "audio": {
                    "en": en_audio_paths,
                    "kr": kr_audio_path
                }
            })
            
            # Save metadata after each word (to prevent data loss if script stops)
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # Example usage
    config_path = Path(__file__).parent.parent / "config" / "voice_config.json"
    generator = TTSGenerator(config_path)
    
    # Process all vocabulary parts
    data_dir = Path(__file__).parent.parent / "data"
    vocabulary_dir = data_dir / "vocabulary_parts"
    
    # Get all vocabulary part files
    vocabulary_files = sorted([f for f in vocabulary_dir.glob("vocabulary_part*.csv")])
    
    for vocab_file in vocabulary_files:
        part_num = vocab_file.stem.split('part')[-1]  # Extract part number
        output_dir = data_dir / "audio" / f"part{part_num}"
        
        if vocab_file.exists():
            print(f"\nProcessing vocabulary part {part_num}...")
            generator.process_vocabulary(vocab_file, output_dir)

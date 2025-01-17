from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pydub import AudioSegment
import os
import tempfile
from pathlib import Path

app = Flask(__name__)
CORS(app)

# 메모리 사용량 제한을 위한 설정
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.mp3', '.wav'}

@app.route('/')
def read_root():
    return jsonify({"status": "healthy", "message": "WordTalkTalk TTS API is running"})

@app.route('/combine-audio', methods=['POST'])
def combine_audio():
    if 'en_audio' not in request.files or 'kr_audio' not in request.files:
        return jsonify({"error": "Missing audio files"}), 400
    
    en_audio = request.files['en_audio']
    kr_audio = request.files['kr_audio']
    
    # 파일 크기 체크
    for audio in [en_audio, kr_audio]:
        audio.seek(0, os.SEEK_END)
        size = audio.tell()
        audio.seek(0)
        if size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large"}), 400
        
        # 파일 확장자 체크
        if Path(audio.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Invalid file type"}), 400
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # 임시 파일로 저장
            en_path = Path(temp_dir) / "en_audio.mp3"
            kr_path = Path(temp_dir) / "kr_audio.mp3"
            
            en_audio.save(en_path)
            kr_audio.save(kr_path)
            
            # 오디오 결합
            en_audio_seg = AudioSegment.from_file(en_path)
            kr_audio_seg = AudioSegment.from_file(kr_path)
            
            # 1초 간격 추가
            silence = AudioSegment.silent(duration=1000)
            combined = en_audio_seg + silence + kr_audio_seg
            
            # 결과 파일 저장
            output_path = Path(temp_dir) / "combined.mp3"
            combined.export(output_path, format="mp3")
            
            return send_file(
                output_path,
                mimetype="audio/mpeg",
                as_attachment=True,
                download_name="combined.mp3"
            )
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

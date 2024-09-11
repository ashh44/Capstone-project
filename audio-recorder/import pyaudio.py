import pyaudio
import wave
import time
import threading
import base64
import requests
import random
from io import BytesIO

# API endpoint and UUID for the audio recording session
API_ENDPOINT = "http://localhost:8080/api/consult/"
#UUID = "60"
UUID = str(random.randint(1,10000))

# Audio recording parameters
FORMAT = pyaudio.paInt16  # Format: LPCM
CHANNELS = 1  # Mono audio
RATE = 44100  # Sample rate (Hz)
CHUNK = 1024  # Number of frames per buffer 
RECORD_SECONDS = 2  # Duration of each recording chunk in seconds
# Initializing PyAudio
audio = pyaudio.PyAudio()
# Creating a file-like buffer for storing the final audio file
final_audio_buffer = BytesIO()
is_recording = True
def record_audio():
    stream = audio.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    print("Recording started...")

    pseudo_timestamp = 0

    while is_recording:
        frames = []
        for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
            data = stream.read(CHUNK)
            frames.append(data)

        # Converting the frames to bytes and encode as base64
        raw_audio_data = b''.join(frames)
        audio_data_base64 = base64.b64encode(raw_audio_data).decode('utf-8')
        print(f"Encoded Base64 string: {audio_data_base64[:100]}")
        sample_length = RECORD_SECONDS * 1000  # 2 seconds -> 2000 milliseconds

        # Preparing the POST request payload
        payload = {
            "audioData": audio_data_base64,
            "sampleRate": RATE,
            "sampleDepth": 16,  # 16-bit depth
            "sampleLength": sample_length,
            "pseudoTimestamp": pseudo_timestamp,
        }
        # Send POST request to the API
        response = requests.post(f"{API_ENDPOINT}{UUID}", json=payload)
        if response.status_code != 200:
            print(f"Failed to send audio data: {response.text}")

        # Append the raw audio data to the final buffer
        final_audio_buffer.write(raw_audio_data)

        # Update pseudoTimestamp for the next chunk
        pseudo_timestamp += sample_length

    stream.stop_stream()
    stream.close()
    audio.terminate()
    print("Recording stopped.")


def save_final_audio_file():
    # Rewind the buffer to the beginning
    final_audio_buffer.seek(0)

    # Save the buffer to a WAV file
    with wave.open(f"{UUID}.wav", 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(final_audio_buffer.read())

    print(f"Final audio file saved as {UUID}.wav")


# Starting the audio recording in a separate thread
recording_thread = threading.Thread(target=record_audio)
recording_thread.start()
try:
    time.sleep(1800)  # Recording for every 30 mins after which the recording will automatically stop
finally:
    is_recording = False
    recording_thread.join()

    # Save the final audio file
    save_final_audio_file()


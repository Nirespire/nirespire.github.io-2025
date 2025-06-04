document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('tts-play');
  const stopBtn = document.getElementById('tts-stop');
  const articleBody = document.querySelector('[itemprop="articleBody"]');

  if (!playBtn || !stopBtn || !articleBody) {
    console.warn('TTS controls not found or article body missing.');
    return;
  }

  let utterance;

  const reset = () => {
    playBtn.textContent = 'Play Audio';
  };

  playBtn.addEventListener('click', () => {
    if (!utterance) {
      utterance = new SpeechSynthesisUtterance(articleBody.innerText);
      utterance.onend = reset;
      speechSynthesis.speak(utterance);
      playBtn.textContent = 'Pause';
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      playBtn.textContent = 'Pause';
    } else if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      playBtn.textContent = 'Resume';
    } else {
      utterance = new SpeechSynthesisUtterance(articleBody.innerText);
      utterance.onend = reset;
      speechSynthesis.speak(utterance);
      playBtn.textContent = 'Pause';
    }
  });

  stopBtn.addEventListener('click', () => {
    speechSynthesis.cancel();
    utterance = null;
    reset();
  });
});

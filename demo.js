const sentences = [
  '今日はいい天気ですね。',
  '私は日本語を勉強しています。',
  'この映画はとても面白いです。',
  '猫は家族と一緒に寝ています。',
  '明日、友達と学校へ行きます。',
  'どうぞよろしくお願いします。'
];
let index = 0;
document.querySelector('#next').addEventListener('click', () => {
  index = (index + 1) % sentences.length;
  document.querySelector('#demo-caption').textContent = sentences[index];
  window.__kotobaDemoTime=index === 5 ? 24 : index*4.5;
  document.querySelector('#count').textContent = `Sentence ${index + 1} of ${sentences.length}`;
});

// Simulated playback time makes transcript seeking/highlighting testable without video.
// The demo transcript is already loaded by the main content script.

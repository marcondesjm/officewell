// Audio notification helper - can be loaded by Service Worker
// This creates a base64 encoded beep sound that can play without user interaction

const BEEP_SOUND_BASE64 = 'data:audio/wav;base64,UklGRhQFAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YfAEAACAf4B/gH+Af4B/gH+Af4B/gH+Af4B/gH+Af4B/gH+Af4B/gH+Af4B/gH+Af4B/gH+Af5F/rX/Gf9x/8X8HgBuALoBAgFGAYIBugHuAhoCQgJmAoYCogK2AsYC0gLaAt4C4gLiAt4C1gLKArgCpgKOAnICUgIuAgYB2gGqAXYBQgEKAM4AkgBWABX/1f+V/1H/Ef7N/on+Rf4B/b39ef01/PH8rfy5/MX80fzd/O389f0B/QH9Af0B/QH9Af0B/QH8+fzt/OH80fy9/Kn8lfx5/F38Qfwl/AH/3fuZ+1n7Efqx+ln6Afql+nH6Qfol+gH59fn1+fH58fnx+fH58fnx+fX5/foB+gn6EfoZ+iH6Kfox+jn6Pfq5+zn7ufg1/LH9Lf2l/iH+nf8R/4X8CgB+ALIBAgVKBZIF0gYSBk4GigbGBv4HMgdqB54H0gQCC';

// Function to create and play notification sound
function playNotificationSound() {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(BEEP_SOUND_BASE64);
      audio.volume = 0.7;
      audio.play()
        .then(resolve)
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

// For use in main thread
if (typeof window !== 'undefined') {
  window.playNotificationSound = playNotificationSound;
}

// Export for modules
if (typeof module !== 'undefined') {
  module.exports = { playNotificationSound, BEEP_SOUND_BASE64 };
}

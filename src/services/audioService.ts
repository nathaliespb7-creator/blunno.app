class AudioService {
  private isUnlocked = false;

  unlock() {
    if (!this.isUnlocked) {
      console.log('Audio unlocked (mock)');
      this.isUnlocked = true;
    }
  }

  play(name: string) {
    if (!this.isUnlocked) return;
    console.log(`Playing sound: ${name}`);
  }
}

export const audioService = new AudioService();

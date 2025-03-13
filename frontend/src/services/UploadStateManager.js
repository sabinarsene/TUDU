export class UploadStateManager {
  constructor() {
    this.uploadStates = new Map();
  }

  saveUploadState(fileId, state) {
    localStorage.setItem(`upload_${fileId}`, JSON.stringify(state));
    this.uploadStates.set(fileId, state);
  }

  getUploadState(fileId) {
    const savedState = localStorage.getItem(`upload_${fileId}`);
    return savedState ? JSON.parse(savedState) : null;
  }

  clearUploadState(fileId) {
    localStorage.removeItem(`upload_${fileId}`);
    this.uploadStates.delete(fileId);
  }

  isUploadIncomplete(fileId) {
    const state = this.getUploadState(fileId);
    return state && state.uploadedChunks.length < state.totalChunks;
  }
}
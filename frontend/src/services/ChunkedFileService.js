export class ChunkedFileService {
  static CHUNK_SIZE = 1024 * 1024; // 1MB chunks

  static async* createFileChunks(file) {
    let offset = 0;
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      yield {
        data: chunk,
        index: Math.floor(offset / this.CHUNK_SIZE),
        total: Math.ceil(file.size / this.CHUNK_SIZE)
      };
      offset += this.CHUNK_SIZE;
    }
  }

  static async uploadChunks(file, onProgress) {
    const chunks = [];
    let uploadedSize = 0;

    for await (const chunk of this.createFileChunks(file)) {
      const formData = new FormData();
      formData.append('chunk', chunk.data);
      formData.append('index', chunk.index);
      formData.append('total', chunk.total);
      formData.append('fileId', file.name + Date.now());

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/chunk`,
        formData
      );

      chunks.push(response.data);
      uploadedSize += chunk.data.size;
      onProgress(Math.round((uploadedSize / file.size) * 100));
    }

    return chunks;
  }
}
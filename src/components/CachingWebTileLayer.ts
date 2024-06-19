import WebTileLayer from '@arcgis/core/layers/WebTileLayer';

class TileCache {
  private readonly dbName: string;
  private readonly storeName: string;
  private db: IDBDatabase | null;

  constructor() {
    this.dbName = 'TileCache';
    this.storeName = 'tiles';
    this.db = null;
    this.init().then(r => r);
  }

  private async init(): Promise<void> {
    if (!window.indexedDB) {
      console.error("Your browser doesn't support IndexedDB.");
      return;
    }

    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve((request as IDBOpenDBRequest).result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(this.storeName, { keyPath: 'id' });
        };
    });
  }

  public async getTile(key: string): Promise<Blob | null> {
    if (!this.db) {
      return null;
    }

    return new Promise<Blob | null>((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.blob : null);
      request.onerror = () => reject(request.error);
    });
  }

  public async cacheTile(key: string, blob: Blob): Promise<void> {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.put({ id: key, blob });
  }
}

class CachingWebTileLayer extends WebTileLayer {
  private cache: TileCache;

 constructor(options: __esri.WebTileLayerProperties) {
    console.log("Initializing CachingWebTileLayer with options:", options);
    // 确保 options 包含 urlTemplate
    if (!options.urlTemplate) {
      throw new Error("Missing urlTemplate property in WebTileLayerProperties.");
    }
    super(options);
    this.cache = new TileCache();
  }

  async fetchTile(level: number, row: number, col: number, options: any): Promise<HTMLImageElement> {
    const key = `${level}/${row}/${col}`;
    const cachedTile = await this.cache.getTile(key);

    if (cachedTile) {
      return createImageBitmap(cachedTile).then(imageBitmap => {
        return createImageElementFromBitmap(imageBitmap);
      });
    }

    const response = await fetch(this.getTileUrl(level, row, col));
    const blob = await response.blob();
    await this.cache.cacheTile(key, blob);
    return createImageBitmap(blob).then(imageBitmap => {
        return createImageElementFromBitmap(imageBitmap);
    });
  }
}

function createImageElementFromBitmap(imageBitmap: ImageBitmap): HTMLImageElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  ctx.drawImage(imageBitmap, 0, 0);
  const img = document.createElement('img');
  img.src = canvas.toDataURL();
  return img;
}

export default CachingWebTileLayer;

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UrlShortenerService {
  private apiUrl = 'https://api.tinyurl.com/create';
  private apiKey = 'e7oTtebekIlY0TrLoIbO0tjfUWkU9pDEhfyM849aBnaY0iB9Lf6KDCp33Tmr';

  constructor(private http: HttpClient) {}

  async shortenQRCodeUrl(qrStorageUrl: string): Promise<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      url: qrStorageUrl,
      domain: 'tiny.one'
    };

    try {
      const response: any = await this.http.post(this.apiUrl, body, { headers }).toPromise();
      const shortenedUrl = response.data.tiny_url;
      console.log('URL acortada:', shortenedUrl);
      return shortenedUrl;
    } catch (error) {
      console.error('Error al acortar la URL:', error);
      throw error;
    }
  }
}

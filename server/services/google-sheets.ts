import { google } from 'googleapis';

export interface GoogleSheetsProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  image?: string;
  category?: string;
}

export interface GoogleSheetsOrder {
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: string;
  products: string; // JSON string
  total: number;
}

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor() {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID || '';
  }

  async getProducts(): Promise<GoogleSheetsProduct[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Productos!A2:H', // Skip header row
      });

      const rows = response.data.values || [];
      
      return rows.map((row: any[], index: number) => ({
        id: row[0] || `product-${index}`,
        name: row[1] || '',
        description: row[2] || '',
        price: parseFloat(row[3]) || 0,
        stock: parseInt(row[4]) || 0,
        active: row[5]?.toLowerCase() === 'true' || row[5] === '1',
        image: row[6] || '',
        category: row[7] || '',
      })).filter(product => product.name && product.active);
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error);
      throw new Error('Failed to fetch products from Google Sheets');
    }
  }

  async saveOrder(order: GoogleSheetsOrder): Promise<void> {
    try {
      const values = [
        [
          order.date,
          order.customerName,
          order.customerEmail,
          order.customerPhone || '',
          order.deliveryAddress,
          order.products,
          order.total,
        ]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Ordenes!A:G',
        valueInputOption: 'RAW',
        resource: {
          values,
        },
      });
    } catch (error) {
      console.error('Error saving order to Google Sheets:', error);
      throw new Error('Failed to save order to Google Sheets');
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();

// models/order.model.ts
export interface OrderDetail {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  // ... các trường khác nếu cần
}

export interface Order {
  id: number;
  code: string;         // Mã đơn hàng (DH0000...)
  customerName: string; // Tên khách
  customerCode: string;
  purchaseDate: string; // Ngày mua
  statusValue: string;  // Trạng thái
  orderDetails: OrderDetail[]; // Danh sách sản phẩm trong đơn
}

export interface OrderResponse {
  total: number;
  pageSize: number;
  data: Order[];
}
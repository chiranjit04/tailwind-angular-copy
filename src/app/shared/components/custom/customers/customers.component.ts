import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../../ui/button/button.component";
import { Customer, KiotVietService } from "../../../services/customer.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-customers",
  standalone: true, // Đã thêm standalone: true cho chắc chắn
  imports: [CommonModule, ButtonComponent, FormsModule],
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.css"],
})
export class CustomersComponent implements OnInit {
  constructor(private kiotVietService: KiotVietService) {}

  // dataCustomers: Danh sách hiển thị (đã lọc)
  public dataCustomers: Customer[] = [];
  // alldataCustomers: Danh sách gốc (không bao giờ đổi)
  public alldataCustomers: Customer[] = [];
  
  public currentPage = 1;
  public itemsPerPage = 10;
  public searchTerm: string = "";

  ngOnInit(): void {
    this.getListCustomer();
  }

  getListCustomer(): void {
    this.kiotVietService.getCustomers().subscribe({
      next: (data) => {
        // Lưu dữ liệu vào cả 2 biến
        this.dataCustomers = data.data;
        this.alldataCustomers = data.data;
      },
      error: (error) => {
        console.error("Error fetching customers:", error);
      },
    });
    this.getListOrders();
  }

  getListOrders(): void {
    this.kiotVietService.getOrders().subscribe({
      next: (data) => {
        console.log("Orders data:", data);
      },
      error: (error) => {
        console.error("Error fetching orders:", error);
      },
    });
  }

  // Getter: Lấy danh sách item cho trang hiện tại
  get currentItems(): Customer[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.dataCustomers.slice(start, start + this.itemsPerPage);
  }

  // Getter: Tổng số trang dựa trên danh sách ĐÃ LỌC
  get totalPages(): number {
    return Math.ceil(this.dataCustomers.length / this.itemsPerPage);
  }

  // Getter: Tạo mảng số trang để dùng trong vòng lặp HTML
  get pagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  findItems() {
    const term = this.searchTerm.trim().toLowerCase();
    
    // QUAN TRỌNG: Reset về trang 1 khi tìm kiếm
    this.currentPage = 1;

    // Nếu ô tìm kiếm trống -> Khôi phục từ danh sách gốc
    if (!term) {
      this.dataCustomers = [...this.alldataCustomers];
      return;
    }

    // Lọc dữ liệu từ danh sách gốc
    this.dataCustomers = this.alldataCustomers.filter((item) => {
      // Sử dụng toán tử ?. để tránh lỗi nếu dữ liệu bị null/undefined
      const sdt = item.contactNumber?.toLowerCase().includes(term);
      const name = item.name?.toLowerCase().includes(term);
      const code = item.code?.toLowerCase().includes(term);
      return sdt || name || code;
    });
  }
}
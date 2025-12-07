import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../../ui/button/button.component";
import { ProductCore, productCoreData } from "./product-core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-data-orders",
  standalone: true,
  imports: [ButtonComponent, CommonModule, FormsModule],
  templateUrl: "./data-orders.component.html",
  styleUrl: "./data-orders.component.css",
})
export class DataOrdersComponent implements OnInit {
  // 1. Tạo biến lưu trữ dữ liệu gốc (không bao giờ bị filter làm thay đổi)
  allProducts: ProductCore[] = []; 
  
  // 2. Biến hiển thị ra màn hình (sẽ thay đổi khi tìm kiếm)
  productCores: ProductCore[] = [];

  public currentPage = 1;
  public itemsPerPage = 7;
  searchTerm: string = "";

  ngOnInit(): void {
    // Lưu dữ liệu vào cả 2 biến
    this.allProducts = productCoreData;
    this.productCores = [...this.allProducts];
  }

  // Getter tính toán danh sách hiển thị cho trang hiện tại
  get currentItems(): ProductCore[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.productCores.slice(start, start + this.itemsPerPage);
  }

  // Getter tính tổng số trang dựa trên danh sách ĐÃ LỌC
  get totalPages(): number {
    return Math.ceil(this.productCores.length / this.itemsPerPage);
  }

  // Hàm tạo mảng số trang để dùng trong vòng lặp @for ở HTML
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

    // 1. Reset về trang 1 ngay lập tức khi tìm kiếm
    this.currentPage = 1;

    // 2. Nếu ô tìm kiếm trống -> Khôi phục từ allProducts
    if (!term) {
      this.productCores = [...this.allProducts];
      return;
    }

    // 3. Lọc từ danh sách gốc (allProducts)
    this.productCores = this.allProducts.filter((item) => {
      const matchSku = item.sku.toLowerCase().includes(term);
      const matchBrand = item.brand.toLowerCase().includes(term);
      return matchSku || matchBrand;
    });
  }
}
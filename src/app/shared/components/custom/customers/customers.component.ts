import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";
import { BadgeComponent } from "../../ui/badge/badge.component";

// Components & Services
import { ButtonComponent } from "../../ui/button/button.component";
import { Customer, KiotVietService } from "../../../services/customer.service";

// 1. Import dữ liệu cấu hình Product Core
import { ProductCore, productCoreData } from "../data-orders/product-core";

// 2. Định nghĩa Interface cho Đơn hàng
export interface OrderDetail {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  code: string;
  purchaseDate: string;
  customerName: string;
  customerCode: string;
  statusValue: string;
  orderDetails: OrderDetail[];
}

// 3. Định nghĩa Interface Mới: Khách hàng kèm Sản phẩm đã mua
// Kế thừa toàn bộ thuộc tính của Customer và thêm mảng purchasedProducts
export interface CustomerWithProducts extends Customer {
  purchasedProducts: {
    sku: string;
    productName: string;
    purchaseDate: string;
    quantity: number;
    coreRules: ProductCore; // Thông tin bảo trì đi kèm
  }[];
}

@Component({
  selector: "app-customers",
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormsModule, BadgeComponent],
  templateUrl: "./customers.component.html",
  styleUrls: ["./customers.component.css"],
})
export class CustomersComponent implements OnInit {
  constructor(private kiotVietService: KiotVietService) {}

  // --- Biến dữ liệu ---
  // Lưu ý: Đổi kiểu dữ liệu thành CustomerWithProducts để chứa được sản phẩm
  public dataCustomers: CustomerWithProducts[] = [];
  public filteredCustomers: CustomerWithProducts[] = [];

  public productCores: ProductCore[] = productCoreData;

  // --- Phân trang & Tìm kiếm ---
  public currentPage = 1;
  public itemsPerPage = 10;
  public searchTerm: string = "";

  ngOnInit(): void {
    this.loadAndFilterData();
  }

  // --- HÀM CHÍNH: Tải và Lọc dữ liệu ---
  loadAndFilterData() {
    // //console.log("⏳ Đang tải và xử lý dữ liệu...");

    forkJoin({
      customersResponse: this.kiotVietService.getCustomers(),
      ordersResponse: this.kiotVietService.getOrders(),
    }).subscribe({
      next: (result) => {
        const allCustomers = result.customersResponse.data;
        const allOrders = result.ordersResponse.data;

        // Map để lưu: Mã Khách Hàng -> Danh sách sản phẩm Core họ đã mua
        // Key: CustomerCode (đã làm sạch), Value: Array sản phẩm
        const customerPurchasesMap = new Map<string, any[]>();

        // --- BƯỚC 1: Duyệt đơn hàng để tìm sản phẩm Core ---
        allOrders.forEach((order: Order) => {
          // Xử lý mã khách hàng (cắt {DEL})
          const rawCode = order.customerCode || "";
          const cleanCustomerCode = rawCode.split("{")[0].trim();

          if (!cleanCustomerCode) return; // Bỏ qua nếu không có mã khách

          // Duyệt chi tiết đơn hàng
          order.orderDetails.forEach((detail) => {
            const productCode = detail.productCode.toLowerCase().trim();

            // Kiểm tra xem sản phẩm có trong danh sách Core không
            const matchedCore = this.productCores.find(
              (core) =>
                productCode === core.sku.toLowerCase().trim() ||
                productCode.includes(core.sku.toLowerCase().trim())
            );

            // Nếu trùng khớp sản phẩm Core
            if (matchedCore) {
              const productInfo = {
                sku: detail.productCode,
                productName: detail.productName,
                quantity: detail.quantity,
                purchaseDate: order.purchaseDate, // Lấy ngày mua từ đơn hàng
                coreRules: matchedCore, // Gắn luật bảo trì vào
              };

              // Thêm vào Map của khách hàng tương ứng
              if (customerPurchasesMap.has(cleanCustomerCode)) {
                customerPurchasesMap.get(cleanCustomerCode)?.push(productInfo);
              } else {
                customerPurchasesMap.set(cleanCustomerCode, [productInfo]);
              }
            }
          });
        });

        // //console.log("🎯 Map sản phẩm khách đã mua:", customerPurchasesMap);

        // --- BƯỚC 2: Lọc và Gộp dữ liệu vào dataCustomers ---

        // Chỉ lấy những khách hàng có tên trong Map (tức là đã mua hàng Core)
        // VÀ gán thêm danh sách sản phẩm vào đối tượng khách hàng
        const processedList: CustomerWithProducts[] = [];

        allCustomers.forEach((cus: Customer) => {
          if (customerPurchasesMap.has(cus.code)) {
            // Tạo đối tượng mới gồm thông tin khách cũ + danh sách sản phẩm
            const newCustomerObj: CustomerWithProducts = {
              ...cus, // Copy toàn bộ thông tin cũ (id, name, phone...)
              purchasedProducts: customerPurchasesMap.get(cus.code) || [],
            };
            processedList.push(newCustomerObj);
          }
        });

        // Gán dữ liệu vào biến hiển thị
        this.filteredCustomers = processedList;
        this.dataCustomers = [...this.filteredCustomers];

        // //console.log(
        //   `✅ Kết quả cuối cùng: ${this.dataCustomers.length} khách hàng.`,
        //   this.dataCustomers
        // );
      },
      error: (err) => {
        console.error("❌ Lỗi tải dữ liệu:", err);
      },
    });
  }

  // --- Logic Phân trang ---
  get currentItems(): CustomerWithProducts[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.dataCustomers.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.dataCustomers.length / this.itemsPerPage);
  }

  get pagesArray(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // --- Logic Tìm kiếm ---
  findItems() {
    const term = this.searchTerm.trim().toLowerCase();
    this.currentPage = 1;

    if (!term) {
      this.dataCustomers = [...this.filteredCustomers];
      return;
    }

    this.dataCustomers = this.filteredCustomers.filter((item) => {
      const sdt = item.contactNumber?.toLowerCase().includes(term);
      const name = item.name?.toLowerCase().includes(term);
      const code = item.code?.toLowerCase().includes(term);

      // (Tùy chọn) Tìm kiếm theo cả tên sản phẩm đã mua?
      const hasProduct = item.purchasedProducts.some((p) =>
        p.productName.toLowerCase().includes(term)
      );

      return sdt || name || code || hasProduct;
    });
  }

  addMonthsISO(isoString: string, n: number, outputFormat = "DD/MM/YYYY") {
    const date = new Date(isoString);
    date.setMonth(date.getMonth() + n);

    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y: any = date.getFullYear();

    return outputFormat.replace("DD", d).replace("MM", m).replace("YYYY", y);
  }
}

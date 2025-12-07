import { Component, OnInit } from "@angular/core";
import { BadgeComponent } from "../../shared/components/ui/badge/badge.component";
import { SafeHtmlPipe } from "../../shared/pipe/safe-html.pipe";
import { CommonModule } from "@angular/common";
import { forkJoin } from "rxjs";
import { KiotVietService } from "../../shared/services/customer.service";
import {
  ProductCore,
  productCoreData,
} from "../../shared/components/custom/data-orders/product-core";

@Component({
  selector: "app-total-customer",
  standalone: true,
  imports: [BadgeComponent, SafeHtmlPipe, CommonModule],
  templateUrl: "./total-customer.component.html",
  styleUrl: "./total-customer.component.css",
})
export class TotalCustomerComponent implements OnInit {
  // --- Các biến hiển thị chỉ số ---
  public totalCustomers: number = 0;
  public totalOrders: number = 0;
  public totalRevenue: number = 0;

  // --- Biến cho tính năng Bảo trì ---
  public maintenanceCurrentMonth: number = 0;
  public maintenanceNextMonth: number = 0;

  public currentMonthStr: string = "";
  public nextMonthStr: string = "";

  // Dữ liệu cấu hình lõi lọc
  private productCores: ProductCore[] = productCoreData;

  public icons = {
    groupIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="fill-current"><path d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"/></svg>`,
    arrowUpIcon: `<svg class="fill-current" width="1em" height="1em" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.06462 1.62393C6.20193 1.47072 6.40135 1.37432 6.62329 1.37432C6.6236 1.37432 6.62391 1.37432 6.62422 1.37432C6.81631 1.37415 7.00845 1.44731 7.15505 1.5938L10.1551 4.5918C10.4481 4.88459 10.4483 5.35946 10.1555 5.65246C9.86273 5.94546 9.38785 5.94562 9.09486 5.65283L7.37329 3.93247L7.37329 10.125C7.37329 10.5392 7.03751 10.875 6.62329 10.875C6.20908 10.875 5.87329 10.5392 5.87329 10.125L5.87329 3.93578L4.15516 5.65281C3.86218 5.94561 3.3873 5.94546 3.0945 5.65248C2.8017 5.35949 2.80185 4.88462 3.09484 4.59182L6.06462 1.62393Z" fill=""></path></svg>`,
    boxIconLine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="fill-current"><path d="M64 64C46.3 64 32 78.3 32 96C32 113.7 46.3 128 64 128L136.9 128L229 404.2C206.5 421.8 192 449.2 192 480C192 533 235 576 288 576C340.4 576 383.1 534 384 481.7L586.1 414.3C602.9 408.7 611.9 390.6 606.3 373.8C600.7 357 582.6 348 565.8 353.6L363.8 421C346.6 398.9 319.9 384.5 289.8 384L197.7 107.8C188.9 81.6 164.5 64 136.9 64L64 64zM240 480C240 453.5 261.5 432 288 432C314.5 432 336 453.5 336 480C336 506.5 314.5 528 288 528C261.5 528 240 506.5 240 480zM312.5 153.3C287.3 161.5 273.5 188.6 281.7 213.8L321.3 335.5C329.5 360.7 356.6 374.5 381.8 366.3L503.5 326.7C528.7 318.5 542.5 291.4 534.3 266.2L494.8 144.5C486.6 119.3 459.5 105.5 434.3 113.7L312.5 153.3z"/></svg>`,
    arrowDownIcon: `<svg class="fill-current" width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill=""></path></svg>`,
    moneyIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="fill-current"><path d="M64 483.6L64 173.5C64 150.3 88.1 134.9 110.3 141.5C198 167.7 260 147 322.4 126.2C386.9 104.7 451.8 83.1 545.7 113.1C564.2 119 576 136.9 576 156.4L576 466.5C576 489.7 551.9 505.1 529.8 498.5C442.1 472.3 380 493 317.7 513.8C253.2 535.3 188.3 556.9 94.4 526.9C75.9 521 64.1 503.1 64.1 483.6zM400 320C400 267 364.2 224 320 224C275.8 224 240 267 240 320C240 373 275.8 416 320 416C364.2 416 400 373 400 320zM184 477.6C188.4 477.6 191.9 473.8 191.2 469.5C186.6 441.7 164.2 420 136 416.5C131.6 416 128 419.6 128 424L128 463.9C128 467.5 130.4 470.7 134 471.6C151.9 475.8 168.3 477.7 184 477.7zM502.5 426.5C507.5 427.3 512 423.5 512 418.5L512 375.9C512 371.5 508.4 367.8 504 368.4C478.8 371.5 458.1 389.3 450.8 413C449.4 417.7 453.1 422.1 458 422.2C472.2 422.6 487 423.9 502.4 426.5zM512 216L512 176.1C512 172.5 509.5 169.3 506 168.4C488.1 164.2 471.7 162.3 456 162.3C451.6 162.3 448.1 166.1 448.8 170.4C453.4 198.2 475.8 219.9 504 223.4C508.4 223.9 512 220.3 512 215.9zM189.2 226.9C190.6 222.2 186.9 217.8 182 217.7C167.8 217.3 153 216 137.6 213.4C132.6 212.6 128.1 216.4 128.1 221.4L128 264C128 268.4 131.6 272.1 136 271.5C161.2 268.4 181.9 250.6 189.2 226.9z"/></svg>`,
    maintenanceIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="fill-current"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>`,
  };

  constructor(private kiotVietService: KiotVietService) {}

  ngOnInit(): void {
    // 1. Lấy thời gian thực của hệ thống
    const now = new Date();

    // 2. Thiết lập hiển thị tháng hiện tại
    this.currentMonthStr = `${now.getMonth() + 1}/${now.getFullYear()}`;

    // 3. Tính toán tháng sau để hiển thị label
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    this.nextMonthStr = `${
      nextMonthDate.getMonth() + 1
    }/${nextMonthDate.getFullYear()}`;

    // 4. Bắt đầu tính toán
    this.calculateMetrics();
  }

  calculateMetrics() {
    forkJoin({
      customersResponse: this.kiotVietService.getCustomers(),
      ordersResponse: this.kiotVietService.getOrders(),
    }).subscribe({
      next: (result) => {
        const allOrders = result.ordersResponse.data;

        // --- CÁC MỐC THỜI GIAN HỆ THỐNG ---
        const now = new Date();
        const currentMonth = now.getMonth(); // 0-11
        const currentYear = now.getFullYear();

        const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
        const nextMonth = nextMonthDate.getMonth();
        const nextMonthYear = nextMonthDate.getFullYear();

        // -----------------------------------------------------------
        // BƯỚC 1: LỌC DANH SÁCH ĐƠN HÀNG HỢP LỆ
        // (Chỉ để xác định khách hàng và tính bảo trì)
        // -----------------------------------------------------------

        // Danh sách đơn hàng chưa hủy (để tính toán lịch sử)
        const validOrdersForHistory = allOrders.filter(
          (order: any) => order.statusValue !== "Đã hủy"
        );

        // -----------------------------------------------------------
        // BƯỚC 2: TÍNH KPI DOANH SỐ + ĐƠN HÀNG TRONG THÁNG
        // -----------------------------------------------------------

        // Lấy các đơn hàng thuộc tháng hiện tại
        const ordersInCurrentMonth = validOrdersForHistory.filter(
          (order: any) => {
            const orderDate = new Date(order.modifiedDate); // Dùng modifiedDate
            return (
              orderDate.getMonth() === currentMonth &&
              orderDate.getFullYear() === currentYear
            );
          }
        );

        // Biến tạm để tính tổng
        let monthlyRevenue = 0;
        let monthlyOrdersCount = 0;
        const uniqueCustomerCodes = new Set<string>();

        // Duyệt qua các đơn hàng trong tháng
        ordersInCurrentMonth.forEach((order: any) => {
          let orderHasCoreProduct = false; // Cờ đánh dấu đơn có chứa sản phẩm core

          // Duyệt chi tiết sản phẩm trong đơn để cộng tiền
          order.orderDetails.forEach((detail: any) => {
            const productCode = detail.productCode.toLowerCase().trim();

            // Kiểm tra xem sản phẩm này có trong ProductCore không
            const isCore = this.productCores.some(
              (core) =>
                productCode === core.sku.toLowerCase().trim() ||
                productCode.includes(core.sku.toLowerCase().trim())
            );

            if (isCore) {
              // CHỈ CỘNG TIỀN NẾU LÀ SẢN PHẨM CORE
              const itemTotal =
                detail.price * detail.quantity - (detail.discount || 0);
              monthlyRevenue += itemTotal;
              orderHasCoreProduct = true;
            }
          });

          // Nếu đơn hàng có ít nhất 1 sản phẩm core -> Tính là 1 đơn hàng + 1 khách
          if (orderHasCoreProduct) {
            monthlyOrdersCount++;

            const rawCode = order.customerCode || "";
            const cleanCode = rawCode.split("{")[0].trim();
            if (cleanCode) uniqueCustomerCodes.add(cleanCode);
          }
        });

        // Gán kết quả KPI
        this.totalRevenue = monthlyRevenue;
        this.totalOrders = monthlyOrdersCount;
        this.totalCustomers = uniqueCustomerCodes.size;

        // -----------------------------------------------------------
        // BƯỚC 3: TÍNH BẢO TRÌ (Dựa trên toàn bộ lịch sử)
        // -----------------------------------------------------------
        let countCurrent = 0;
        let countNext = 0;

        validOrdersForHistory.forEach((order: any) => {
          const buyDate = new Date(order.modifiedDate); // Ngày mua
          const buyMonth = buyDate.getMonth();
          const buyYear = buyDate.getFullYear();

          order.orderDetails.forEach((detail: any) => {
            const productCode = detail.productCode.toLowerCase().trim();
            const quantity = detail.quantity || 1;

            const matchedCore = this.productCores.find(
              (core) =>
                productCode === core.sku.toLowerCase().trim() ||
                productCode.includes(core.sku.toLowerCase().trim())
            );

            if (matchedCore && matchedCore.lifetimes) {
              matchedCore.lifetimes.forEach((lifetimeMonths) => {
                if (!lifetimeMonths || lifetimeMonths <= 0) return;

                // Tính bảo trì tháng này
                const diffCurrent =
                  (currentYear - buyYear) * 12 + (currentMonth - buyMonth);
                if (diffCurrent > 0 && diffCurrent % lifetimeMonths === 0) {
                  countCurrent += quantity;
                }

                // Tính bảo trì tháng sau
                const diffNext =
                  (nextMonthYear - buyYear) * 12 + (nextMonth - buyMonth);
                if (diffNext > 0 && diffNext % lifetimeMonths === 0) {
                  countNext += quantity;
                }
              });
            }
          });
        });

        this.maintenanceCurrentMonth = countCurrent;
        this.maintenanceNextMonth = countNext;
      },
      error: (err) => console.error(err),
    });
  }
}

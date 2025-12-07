import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexStroke, ApexLegend, ApexYAxis, ApexGrid, ApexFill, ApexTooltip } from 'ng-apexcharts';
import { DropdownComponent } from '../../shared/components/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../shared/components/ui/dropdown/dropdown-item/dropdown-item.component';
import { ProductCore, productCoreData } from '../../shared/components/custom/data-orders/product-core';
import { KiotVietService } from '../../shared/services/customer.service';

type FilterType = 'Day' | 'Week' | 'Month' | 'Year';

@Component({
  selector: 'app-chart-orders',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent,
  ],
  templateUrl: './chart-orders.component.html'
})
export class ChartOrdersComponent implements OnInit {
  
  private productCores: ProductCore[] = productCoreData;
  
  // Cache dữ liệu để không gọi lại API khi đổi filter
  private allCachedOrders: any[] = []; 

  // Cấu hình Filter
  public currentFilter: FilterType = 'Year';
  public currentFilterLabel: string = 'Năm nay (Theo tháng)';
  public isOpen = false;

  // --- Chart Config ---
  public series: ApexAxisChartSeries = [{ name: 'Doanh thu', data: [] }];
  public chart: ApexChart = { 
    fontFamily: 'Outfit, sans-serif', 
    type: 'bar', 
    height: 300, // Tăng chiều cao chút cho đẹp
    toolbar: { show: false },
    animations: { enabled: true } // Bật hiệu ứng chuyển đổi
  };
  public xaxis: ApexXAxis = { categories: [], axisBorder: { show: false }, axisTicks: { show: false } };
  public plotOptions: ApexPlotOptions = { bar: { horizontal: false, columnWidth: '50%', borderRadius: 4, borderRadiusApplication: 'end' } };
  public dataLabels: ApexDataLabels = { enabled: false };
  public stroke: ApexStroke = { show: true, width: 4, colors: ['transparent'] };
  public legend: ApexLegend = { show: true, position: 'top', horizontalAlign: 'left', fontFamily: 'Outfit' };
  
  public yaxis: ApexYAxis = { 
    title: { text: undefined },
    labels: { 
      // Format số tiền trục Y: 1M, 500k...
      formatter: (value) => {
        if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
        return value.toFixed(0);
      } 
    }
  };
  
  public grid: ApexGrid = { yaxis: { lines: { show: true } }, padding: { top: 0, right: 0, bottom: 0, left: 10 } };
  public fill: ApexFill = { opacity: 1 };
  
  public tooltip: ApexTooltip = { 
    x: { show: true }, 
    y: { 
      // Format tooltip tiền Việt
      formatter: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) 
    } 
  };
  
  public colors: string[] = ['#465fff'];

  constructor(private kiotVietService: KiotVietService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.kiotVietService.getOrders().subscribe({
      next: (response: any) => {
        this.allCachedOrders = response.data || [];
        // Lần đầu tải xong thì hiển thị luôn
        this.updateChartData(); 
      },
      error: (err) => console.error("Lỗi lấy dữ liệu:", err)
    });
  }

  setFilter(type: FilterType) {
    this.currentFilter = type;
    this.closeDropdown();
    
    switch(type) {
      case 'Day': this.currentFilterLabel = 'Hôm nay (Theo giờ)'; break;
      case 'Week': this.currentFilterLabel = 'Tuần này (Thứ 2 - CN)'; break;
      case 'Month': this.currentFilterLabel = 'Tháng này (Theo ngày)'; break;
      case 'Year': this.currentFilterLabel = 'Năm nay (Theo tháng)'; break;
    }

    this.updateChartData();
  }

  updateChartData() {
    if (!this.allCachedOrders || this.allCachedOrders.length === 0) return;

    let categories: string[] = [];
    let dataSeries: number[] = [];
    
    // Lấy thời gian hệ thống
    const now = new Date(); 
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDate = now.getDate();

    // --- LOGIC XỬ LÝ DỮ LIỆU ---

    if (this.currentFilter === 'Year') {
      // 1. THEO NĂM (12 Tháng)
      categories = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      dataSeries = Array(12).fill(0);

      this.allCachedOrders.forEach(order => {
        if (order.statusValue === 'Đã hủy') return;
        
        // SỬ DỤNG MODIFIED DATE
        const d = new Date(order.modifiedDate); 
        
        if (d.getFullYear() === currentYear) {
          dataSeries[d.getMonth()] += this.calculateOrderCoreRevenue(order);
        }
      });

    } else if (this.currentFilter === 'Month') {
      // 2. THEO THÁNG (Số ngày trong tháng)
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      categories = Array.from({length: daysInMonth}, (_, i) => `${i + 1}`);
      dataSeries = Array(daysInMonth).fill(0);

      this.allCachedOrders.forEach(order => {
        if (order.statusValue === 'Đã hủy') return;
        
        const d = new Date(order.modifiedDate);
        
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          // Ngày 1 nằm ở index 0
          dataSeries[d.getDate() - 1] += this.calculateOrderCoreRevenue(order);
        }
      });

    } else if (this.currentFilter === 'Week') {
      // 3. THEO TUẦN (Thứ 2 -> CN)
      categories = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
      dataSeries = Array(7).fill(0);

      // Tính ngày đầu tuần (Thứ 2)
      const dayOfWeek = now.getDay(); // 0 (CN) -> 6 (T7)
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      this.allCachedOrders.forEach(order => {
        if (order.statusValue === 'Đã hủy') return;
        
        const d = new Date(order.modifiedDate);
        
        // Kiểm tra trong khoảng tuần này
        if (d >= startOfWeek && d < endOfWeek) {
          // Map: CN(0)->6, T2(1)->0, T3(2)->1...
          const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
          dataSeries[dayIndex] += this.calculateOrderCoreRevenue(order);
        }
      });

    } else if (this.currentFilter === 'Day') {
      // 4. THEO NGÀY (0h - 23h)
      categories = Array.from({length: 24}, (_, i) => `${i}h`);
      dataSeries = Array(24).fill(0);

      this.allCachedOrders.forEach(order => {
        if (order.statusValue === 'Đã hủy') return;
        
        const d = new Date(order.modifiedDate);
        
        // Kiểm tra đúng ngày/tháng/năm
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === currentDate) {
          dataSeries[d.getHours()] += this.calculateOrderCoreRevenue(order);
        }
      });
    }

    // --- Cập nhật Biểu đồ ---
    this.xaxis = { ...this.xaxis, categories: categories };
    this.series = [{ name: 'Doanh thu', data: dataSeries }];
  }

  // Hàm tính tổng tiền sản phẩm (chỉ tính sp có trong ProductCore)
  private calculateOrderCoreRevenue(order: any): number {
    let revenue = 0;
    if (!order.orderDetails) return 0;

    order.orderDetails.forEach((detail: any) => {
      const productCode = detail.productCode.toLowerCase().trim();
      
      // Check xem mã sản phẩm có nằm trong danh sách Core không
      const isCore = this.productCores.some(core => 
        productCode === core.sku.toLowerCase().trim() || 
        productCode.includes(core.sku.toLowerCase().trim())
      );

      if (isCore) {
        // Doanh thu = (Giá * SL) - Chiết khấu
        const val = (detail.price * detail.quantity) - (detail.discount || 0);
        revenue += val;
      }
    });
    return revenue;
  }

  toggleDropdown() { this.isOpen = !this.isOpen; }
  closeDropdown() { this.isOpen = false; }
}
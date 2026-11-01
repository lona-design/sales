/**
 * ApexSales Analytics Dashboard
 * Pure Vanilla JavaScript Implementation
 * Persistent WebStorage (localStorage) | Zero Backend | Zero CSS Variables
 */

(function () {
  'use strict';

  // Constants
  const STORAGE_KEY = 'APEX_SALES_RECORDS_V1';
  const QUARTER_TARGET = 250000;
  const ROWS_PER_PAGE = 8;

  // Color Palette (Explicit Hex Values - Strict NO CSS Variables)
  const PALETTE = {
    primary: '#2563eb',
    primaryLight: 'rgba(37, 99, 235, 0.15)',
    emerald: '#10b981',
    emeraldLight: 'rgba(16, 185, 129, 0.15)',
    amber: '#f59e0b',
    amberLight: 'rgba(245, 158, 11, 0.15)',
    purple: '#8b5cf6',
    purpleLight: 'rgba(139, 92, 246, 0.15)',
    cyan: '#06b6d4',
    cyanLight: 'rgba(6, 182, 212, 0.15)',
    slateGrid: '#e2e8f0',
    slateText: '#64748b',
    slateDark: '#0f172a'
  };

  const CATEGORY_COLORS = {
    'Enterprise SaaS': '#2563eb',
    'Hardware': '#06b6d4',
    'Professional Services': '#8b5cf6',
    'Consumer Goods': '#f59e0b',
    'Cloud Infrastructure': '#10b981'
  };

  // State Management
  const state = {
    transactions: [],
    filteredTransactions: [],
    currentPeriod: '30', // '7', '30', '90', '365', 'all'
    searchQuery: '',
    filterCategory: 'all',
    filterStatus: 'all',
    sortColumn: 'date',
    sortDirection: 'desc',
    currentPage: 1,
    secondaryChartView: 'channel', // 'channel' or 'region'
    editingTransactionId: null
  };

  // ==========================================
  // Demo Data Generator
  // ==========================================
  function generateDemoDataset() {
    const reps = ['Sarah Jenkins', 'Marcus Vance', 'Elena Rostova', 'David Kim', 'Chloe Bennett'];
    const categories = [
      { name: 'Enterprise SaaS', items: ['Apex Cloud Suite', 'API Gateway Pro', 'Security Shield AI', 'Enterprise License (100 seats)'] },
      { name: 'Hardware', items: ['Edge IoT Sensor Hub', 'Biometric Gateway Terminal', 'Enterprise Rack Server', 'Security Key Bundle'] },
      { name: 'Professional Services', items: ['DevOps Audit & Migration', 'Custom Architecture Consulting', 'Quarterly SLA Support', 'Security Pentest'] },
      { name: 'Consumer Goods', items: ['Ergonomic Workspace Pack', 'Smart LED Sensor Desk', 'Noise Cancelling Headset', 'PowerStation Max'] },
      { name: 'Cloud Infrastructure', items: ['Multi-Region Storage Cluster', 'Managed Kubernetes Node Pool', 'High-Bandwidth CDN Pack', 'Database Dedicated Host'] }
    ];
    const regions = ['North America', 'Europe (EMEA)', 'Asia Pacific (APAC)', 'Latin America'];
    const channels = ['Direct Sales', 'Inbound Web', 'Partner Referral', 'Events & Expos', 'Outbound SDR'];
    const customers = [
      { name: 'Acme Global Corp', email: 'procurement@acmeglobal.com' },
      { name: 'Starlight Tech Inc', email: 'billing@starlight.io' },
      { name: 'Nova Health Systems', email: 'it.purchasing@novahealth.org' },
      { name: 'Horizon Financial Group', email: 'vendor.ops@horizonfg.com' },
      { name: 'Vanguard Dynamics', email: 'accounts@vanguard-dyn.com' },
      { name: 'Quantum Logistics', email: 'finance@quantumlogistics.net' },
      { name: 'Beacon Software', email: 'licenses@beacon.dev' },
      { name: 'Summit Retail Group', email: 'supply@summitretail.com' },
      { name: 'Nexus Media Lab', email: 'tech@nexusmedialab.com' },
      { name: 'Aegis Security LLC', email: 'ops@aegissecurity.com' },
      { name: 'Pinnacle Aerospace', email: 'billing@pinnacleaero.com' },
      { name: 'Atlas Robotics', email: 'finance@atlasrobotics.co' }
    ];

    const records = [];
    const now = new Date();

    // Generate 45 realistic records spread across the last 60 days
    for (let i = 1; i <= 45; i++) {
      const daysAgo = Math.floor(Math.pow(Math.random(), 1.2) * 58);
      const recordDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const categoryObj = categories[Math.floor(Math.random() * categories.length)];
      const product = categoryObj.items[Math.floor(Math.random() * categoryObj.items.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const rep = reps[Math.floor(Math.random() * reps.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];

      const basePrices = {
        'Enterprise SaaS': [1200, 2400, 4800, 8500],
        'Hardware': [850, 1500, 3200, 6000],
        'Professional Services': [2000, 3500, 5000, 10000],
        'Consumer Goods': [250, 450, 800, 1200],
        'Cloud Infrastructure': [1800, 3200, 7500, 12500]
      };

      const priceList = basePrices[categoryObj.name];
      const unitPrice = priceList[Math.floor(Math.random() * priceList.length)];
      const quantity = Math.random() > 0.75 ? Math.floor(Math.random() * 4) + 1 : 1;
      const discount = Math.random() > 0.6 ? Math.floor(Math.random() * 3 + 1) * 5 : 0;
      
      const subtotal = unitPrice * quantity;
      const amount = Math.round(subtotal * (1 - discount / 100) * 100) / 100;
      
      // COGS margin depends on category
      const cogsRate = categoryObj.name === 'Enterprise SaaS' ? 0.18 :
                       categoryObj.name === 'Cloud Infrastructure' ? 0.32 :
                       categoryObj.name === 'Professional Services' ? 0.40 :
                       categoryObj.name === 'Hardware' ? 0.52 : 0.45;
      
      const cost = Math.round(amount * cogsRate * 100) / 100;
      const profit = Math.round((amount - cost) * 100) / 100;

      // Status distribution: ~85% Completed, 10% Pending, 5% Refunded
      const randStatus = Math.random();
      const status = randStatus > 0.12 ? 'Completed' : (randStatus > 0.05 ? 'Pending' : 'Refunded');

      records.push({
        id: 'INV-' + (1000 + i),
        date: recordDate.toISOString().split('T')[0],
        timestamp: recordDate.getTime(),
        customer: customer.name,
        email: customer.email,
        category: categoryObj.name,
        product: product,
        unitPrice: unitPrice,
        quantity: quantity,
        discount: discount,
        amount: amount,
        cost: cost,
        profit: status === 'Refunded' ? -cost : profit,
        rep: rep,
        region: region,
        channel: channel,
        status: status
      });
    }

    // Sort descending by date
    records.sort((a, b) => b.timestamp - a.timestamp);
    return records;
  }

  // ==========================================
  // Storage Handlers
  // ==========================================
  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.transactions = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Storage read failed, initializing demo data:', e);
    }
    
    // Seed initial dataset if storage is empty
    state.transactions = generateDemoDataset();
    saveTransactions();
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
    } catch (e) {
      console.error('Storage write error:', e);
      showToast('Error saving data to local storage', 'error');
    }
  }

  // ==========================================
  // Formatters
  // ==========================================
  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2
    }).format(val || 0);
  }

  function formatCompactCurrency(val) {
    if (Math.abs(val) >= 1000000) {
      return '$' + (val / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(val) >= 1000) {
      return '$' + (val / 1000).toFixed(1) + 'k';
    }
    return '$' + Math.round(val);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  // ==========================================
  // Toast Notifications
  // ==========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = iconSvg + '<span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // ==========================================
  // Data Filtering & Analytics Calculations
  // ==========================================
  function getPeriodDateThreshold(days) {
    if (days === 'all') return 0;
    const d = new Date();
    d.setDate(d.getDate() - parseInt(days, 10));
    return d.getTime();
  }

  function getPeriodTransactions() {
    const threshold = getPeriodDateThreshold(state.currentPeriod);
    if (threshold === 0) return [...state.transactions];
    return state.transactions.filter(t => t.timestamp >= threshold);
  }

  function getPreviousPeriodTransactions() {
    if (state.currentPeriod === 'all') return [];
    const days = parseInt(state.currentPeriod, 10);
    const now = new Date().getTime();
    const currentThreshold = now - days * 24 * 60 * 60 * 1000;
    const priorThreshold = now - (days * 2) * 24 * 60 * 60 * 1000;
    return state.transactions.filter(t => t.timestamp >= priorThreshold && t.timestamp < currentThreshold);
  }

  function calculateKPIs(currentList, priorList) {
    const currentCompleted = currentList.filter(t => t.status !== 'Refunded');
    const priorCompleted = priorList.filter(t => t.status !== 'Refunded');

    const totalRevenue = currentCompleted.reduce((acc, t) => acc + t.amount, 0);
    const priorRevenue = priorCompleted.reduce((acc, t) => acc + t.amount, 0);

    const totalProfit = currentCompleted.reduce((acc, t) => acc + t.profit, 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const totalOrders = currentList.length;
    const priorOrders = priorList.length;

    const completedOrders = currentCompleted.length;
    const completedRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const aov = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Revenue Trend %
    let revenueDeltaPct = 0;
    if (priorRevenue > 0) {
      revenueDeltaPct = ((totalRevenue - priorRevenue) / priorRevenue) * 100;
    } else if (totalRevenue > 0) {
      revenueDeltaPct = 100;
    }

    // Orders Trend %
    let ordersDeltaPct = 0;
    if (priorOrders > 0) {
      ordersDeltaPct = ((totalOrders - priorOrders) / priorOrders) * 100;
    } else if (totalOrders > 0) {
      ordersDeltaPct = 100;
    }

    return {
      totalRevenue,
      revenueDeltaPct,
      totalProfit,
      profitMargin,
      totalOrders,
      ordersDeltaPct,
      completedRate,
      aov
    };
  }

  // ==========================================
  // Render KPI Metrics
  // ==========================================
  function renderKPIs() {
    const currentList = getPeriodTransactions();
    const priorList = getPreviousPeriodTransactions();
    const kpis = calculateKPIs(currentList, priorList);

    // Revenue
    const revEl = document.getElementById('kpiRevenueVal');
    if (revEl) revEl.textContent = formatCurrency(kpis.totalRevenue);

    const revTrendEl = document.getElementById('kpiRevenueTrend');
    if (revTrendEl) {
      const isPositive = kpis.revenueDeltaPct >= 0;
      revTrendEl.className = 'kpi-trend ' + (isPositive ? 'trend-positive' : 'trend-negative');
      const arrowSvg = isPositive
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>';
      revTrendEl.innerHTML = arrowSvg + (isPositive ? '+' : '') + kpis.revenueDeltaPct.toFixed(1) + '%';
    }

    // Net Profit & Margin
    const profEl = document.getElementById('kpiProfitVal');
    if (profEl) profEl.textContent = formatCurrency(kpis.totalProfit);

    const marginEl = document.getElementById('kpiProfitMargin');
    if (marginEl) marginEl.textContent = 'Margin: ' + kpis.profitMargin.toFixed(1) + '%';

    // Orders Count
    const ordEl = document.getElementById('kpiOrdersVal');
    if (ordEl) ordEl.textContent = kpis.totalOrders.toLocaleString();

    const ordTrendEl = document.getElementById('kpiOrdersTrend');
    if (ordTrendEl) {
      const isPositive = kpis.ordersDeltaPct >= 0;
      ordTrendEl.className = 'kpi-trend ' + (isPositive ? 'trend-positive' : 'trend-negative');
      const arrowSvg = isPositive
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>';
      ordTrendEl.innerHTML = arrowSvg + (isPositive ? '+' : '') + kpis.ordersDeltaPct.toFixed(1) + '%';
    }

    const compRateEl = document.getElementById('kpiCompletedRate');
    if (compRateEl) compRateEl.textContent = kpis.completedRate + '% fulfilled';

    // Average Order Value
    const aovEl = document.getElementById('kpiAOVVal');
    if (aovEl) aovEl.textContent = formatCurrency(kpis.aov);

    // Sidebar Goal Progress
    const allRevenue = state.transactions
      .filter(t => t.status !== 'Refunded')
      .reduce((sum, t) => sum + t.amount, 0);
    const goalPct = Math.min(100, Math.round((allRevenue / QUARTER_TARGET) * 100));

    const progressFill = document.getElementById('sidebarProgressFill');
    if (progressFill) progressFill.style.width = goalPct + '%';

    const progressText = document.getElementById('sidebarProgressText');
    if (progressText) {
      progressText.textContent = formatCompactCurrency(allRevenue) + ' / ' + formatCompactCurrency(QUARTER_TARGET);
    }

    const progressPercent = document.getElementById('sidebarProgressPercent');
    if (progressPercent) progressPercent.textContent = goalPct + '%';
  }

  // ==========================================
  // Chart Helper: HiDPI Canvas Setup
  // ==========================================
  function setupHiDPICanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : (canvas.clientWidth || 300);
    const height = parent ? parent.clientHeight : (canvas.clientHeight || 200);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height, dpr };
  }

  // ==========================================
  // Chart 1: Revenue & Profit Velocity Line/Area Chart
  // ==========================================
  let trendPoints = [];

  function renderTrendChart() {
    const canvas = document.getElementById('revenueTrendCanvas');
    if (!canvas) return;

    const { ctx, width, height } = setupHiDPICanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const currentList = getPeriodTransactions().filter(t => t.status !== 'Refunded');
    
    // Aggregate by date
    const dateMap = {};
    // Ensure chronological ordering
    currentList.forEach(t => {
      if (!dateMap[t.date]) {
        dateMap[t.date] = { revenue: 0, profit: 0, date: t.date };
      }
      dateMap[t.date].revenue += t.amount;
      dateMap[t.date].profit += t.profit;
    });

    const dates = Object.keys(dateMap).sort();
    if (dates.length === 0) {
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No sales activity recorded for this period', width / 2, height / 2);
      trendPoints = [];
      return;
    }

    // Chart margins
    const padding = { top: 25, right: 30, bottom: 40, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Find max value
    const maxVal = Math.max(...dates.map(d => dateMap[d].revenue), 100);
    const yMax = Math.ceil((maxVal * 1.15) / 1000) * 1000;

    // Draw horizontal grid lines & Y-axis labels
    const gridLines = 4;
    ctx.strokeStyle = PALETTE.slateGrid;
    ctx.lineWidth = 1;
    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '11.5px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = (yMax / gridLines) * i;
      const yPos = padding.top + chartH - (i / gridLines) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillText(formatCompactCurrency(yVal), padding.left - 10, yPos);
    }

    // Compute coordinate points
    trendPoints = dates.map((d, idx) => {
      const x = padding.left + (idx / Math.max(dates.length - 1, 1)) * chartW;
      const revY = padding.top + chartH - (dateMap[d].revenue / yMax) * chartH;
      const profY = padding.top + chartH - (dateMap[d].profit / yMax) * chartH;
      return {
        x,
        revY,
        profY,
        date: d,
        revenue: dateMap[d].revenue,
        profit: dateMap[d].profit
      };
    });

    // Helper: Draw smooth bezier line and area gradient
    function drawAreaAndLine(pointKeys, strokeColor, gradientStartColor) {
      if (pointKeys.length === 0) return;

      // Area fill
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, gradientStartColor);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(pointKeys[0].x, padding.top + chartH);
      ctx.lineTo(pointKeys[0].x, pointKeys[0].y);

      for (let i = 0; i < pointKeys.length - 1; i++) {
        const xc = (pointKeys[i].x + pointKeys[i + 1].x) / 2;
        const yc = (pointKeys[i].y + pointKeys[i + 1].y) / 2;
        ctx.quadraticCurveTo(pointKeys[i].x, pointKeys[i].y, xc, yc);
      }
      if (pointKeys.length > 1) {
        const last = pointKeys[pointKeys.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.lineTo(pointKeys[pointKeys.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      ctx.moveTo(pointKeys[0].x, pointKeys[0].y);
      for (let i = 0; i < pointKeys.length - 1; i++) {
        const xc = (pointKeys[i].x + pointKeys[i + 1].x) / 2;
        const yc = (pointKeys[i].y + pointKeys[i + 1].y) / 2;
        ctx.quadraticCurveTo(pointKeys[i].x, pointKeys[i].y, xc, yc);
      }
      if (pointKeys.length > 1) {
        const last = pointKeys[pointKeys.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dots
      pointKeys.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw Profit Area & Line
    const profitPts = trendPoints.map(p => ({ x: p.x, y: p.profY }));
    drawAreaAndLine(profitPts, PALETTE.emerald, PALETTE.emeraldLight);

    // Draw Revenue Area & Line
    const revenuePts = trendPoints.map(p => ({ x: p.x, y: p.revY }));
    drawAreaAndLine(revenuePts, PALETTE.primary, PALETTE.primaryLight);

    // Draw X-axis Dates (sample evenly if many dates)
    ctx.fillStyle = PALETTE.slateText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(dates.length / 6));

    for (let i = 0; i < dates.length; i += step) {
      const pt = trendPoints[i];
      const dParts = pt.date.split('-');
      const label = dParts[1] + '/' + dParts[2];
      ctx.fillText(label, pt.x, padding.top + chartH + 10);
    }
  }

  // Setup hover interaction for Trend Chart
  function setupTrendChartHover() {
    const canvas = document.getElementById('revenueTrendCanvas');
    const tooltip = document.getElementById('trendChartTooltip');
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', function (e) {
      if (trendPoints.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      // Find closest point
      let closest = null;
      let minDist = Infinity;

      trendPoints.forEach(pt => {
        const dist = Math.abs(pt.x - mouseX);
        if (dist < minDist) {
          minDist = dist;
          closest = pt;
        }
      });

      if (closest && minDist < 40) {
        tooltip.style.display = 'block';
        tooltip.style.left = closest.x + 'px';
        tooltip.style.top = Math.min(closest.revY, closest.profY) - 10 + 'px';
        tooltip.innerHTML = `
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${formatDate(closest.date)}</div>
          <div style="color: #60a5fa; font-weight: 700;">Revenue: ${formatCurrency(closest.revenue)}</div>
          <div style="color: #34d399; font-weight: 700;">Profit: ${formatCurrency(closest.profit)}</div>
        `;
      } else {
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
    });
  }

  // ==========================================
  // Chart 2: Category Donut Chart
  // ==========================================
  let donutSlices = [];

  function renderCategoryDonutChart() {
    const canvas = document.getElementById('categoryDonutCanvas');
    const legendContainer = document.getElementById('categoryLegendList');
    if (!canvas || !legendContainer) return;

    const { ctx, width, height } = setupHiDPICanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const currentList = getPeriodTransactions().filter(t => t.status !== 'Refunded');

    const catMap = {};
    let totalCatRevenue = 0;

    currentList.forEach(t => {
      const cat = t.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + t.amount;
      totalCatRevenue += t.amount;
    });

    const categories = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]);
    const catCountBadge = document.getElementById('totalCategoriesCount');
    if (catCountBadge) catCountBadge.textContent = categories.length + ' Categories';

    if (totalCatRevenue === 0 || categories.length === 0) {
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data available', width / 2, height / 2);
      legendContainer.innerHTML = '<div style="color: #94a3b8; font-size: 12px; text-align: center;">No category data</div>';
      donutSlices = [];
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const innerRadius = radius * 0.62;

    let startAngle = -Math.PI / 2;
    donutSlices = [];

    categories.forEach(cat => {
      const val = catMap[cat];
      const sliceAngle = (val / totalCatRevenue) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const color = CATEGORY_COLORS[cat] || PALETTE.primary;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      donutSlices.push({
        category: cat,
        amount: val,
        percentage: (val / totalCatRevenue) * 100,
        startAngle,
        endAngle,
        color
      });

      startAngle = endAngle;
    });

    // Inner circle center label
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = PALETTE.slateDark;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatCompactCurrency(totalCatRevenue), centerX, centerY - 8);

    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '10.5px sans-serif';
    ctx.fillText('Total Net', centerX, centerY + 10);

    // Populate Legend
    legendContainer.innerHTML = donutSlices.map(slice => {
      return `
        <div class="donut-legend-item">
          <div class="donut-legend-left">
            <span class="donut-legend-swatch" style="background-color: ${slice.color};"></span>
            <span class="donut-legend-label">${slice.category}</span>
          </div>
          <div class="donut-legend-right">
            <span class="donut-legend-amount">${formatCompactCurrency(slice.amount)}</span>
            <span class="donut-legend-pct">${slice.percentage.toFixed(0)}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function setupDonutChartHover() {
    const canvas = document.getElementById('categoryDonutCanvas');
    const tooltip = document.getElementById('donutChartTooltip');
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', function (e) {
      if (donutSlices.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const dist = Math.sqrt(x * x + y * y);
      const radius = Math.min(rect.width / 2, rect.height / 2) - 10;
      const innerRadius = radius * 0.62;

      if (dist >= innerRadius && dist <= radius) {
        let angle = Math.atan2(y, x);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;

        const slice = donutSlices.find(s => angle >= s.startAngle && angle <= s.endAngle);
        if (slice) {
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX - rect.left + 'px';
          tooltip.style.top = e.clientY - rect.top - 15 + 'px';
          tooltip.innerHTML = `
            <div style="font-weight: 700; color: #ffffff;">${slice.category}</div>
            <div style="color: #94a3b8; font-size: 11px;">${formatCurrency(slice.amount)} (${slice.percentage.toFixed(1)}%)</div>
          `;
          return;
        }
      }
      tooltip.style.display = 'none';
    });

    canvas.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
    });
  }

  // ==========================================
  // Chart 3: Channels / Regions Bar Chart
  // ==========================================
  let barSlices = [];

  function renderChannelBarChart() {
    const canvas = document.getElementById('channelBarCanvas');
    if (!canvas) return;

    const { ctx, width, height } = setupHiDPICanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const currentList = getPeriodTransactions().filter(t => t.status !== 'Refunded');
    const field = state.secondaryChartView === 'channel' ? 'channel' : 'region';

    const groupMap = {};
    currentList.forEach(t => {
      const key = t[field] || 'Unknown';
      groupMap[key] = (groupMap[key] || 0) + t.amount;
    });

    const labels = Object.keys(groupMap).sort((a, b) => groupMap[b] - groupMap[a]);
    if (labels.length === 0) {
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No breakdown data for selected period', width / 2, height / 2);
      barSlices = [];
      return;
    }

    const padding = { top: 25, right: 30, bottom: 45, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...labels.map(l => groupMap[l]), 100);
    const yMax = Math.ceil((maxVal * 1.15) / 1000) * 1000;

    // Grid lines
    const gridLines = 4;
    ctx.strokeStyle = PALETTE.slateGrid;
    ctx.lineWidth = 1;
    ctx.fillStyle = PALETTE.slateText;
    ctx.font = '11.5px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = (yMax / gridLines) * i;
      const yPos = padding.top + chartH - (i / gridLines) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();

      ctx.fillText(formatCompactCurrency(yVal), padding.left - 10, yPos);
    }

    // Render Bars
    const totalBars = labels.length;
    const slotW = chartW / totalBars;
    const barW = Math.min(42, slotW * 0.55);

    barSlices = [];

    labels.forEach((label, idx) => {
      const val = groupMap[label];
      const barH = (val / yMax) * chartH;
      const x = padding.left + idx * slotW + (slotW - barW) / 2;
      const y = padding.top + chartH - barH;

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#1d4ed8');

      ctx.fillStyle = grad;
      // Draw rounded bar
      ctx.beginPath();
      const r = Math.min(5, barW / 2);
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.closePath();
      ctx.fill();

      barSlices.push({
        label,
        val,
        x,
        y,
        width: barW,
        height: barH
      });

      // Label on X-axis
      ctx.fillStyle = PALETTE.slateDark;
      ctx.font = '11.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Shorten label if needed
      const displayLabel = label.length > 12 ? label.substring(0, 10) + '..' : label;
      ctx.fillText(displayLabel, x + barW / 2, padding.top + chartH + 10);
    });
  }

  function setupChannelBarHover() {
    const canvas = document.getElementById('channelBarCanvas');
    const tooltip = document.getElementById('barChartTooltip');
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', function (e) {
      if (barSlices.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hovered = barSlices.find(b => {
        return mouseX >= b.x - 4 && mouseX <= b.x + b.width + 4 && mouseY >= b.y && mouseY <= b.y + b.height + 10;
      });

      if (hovered) {
        tooltip.style.display = 'block';
        tooltip.style.left = hovered.x + hovered.width / 2 + 'px';
        tooltip.style.top = hovered.y - 10 + 'px';
        tooltip.innerHTML = `
          <div style="font-weight: 700; color: #ffffff;">${hovered.label}</div>
          <div style="color: #60a5fa; font-weight: 600;">${formatCurrency(hovered.val)}</div>
        `;
      } else {
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseleave', function () {
      tooltip.style.display = 'none';
    });
  }

  // ==========================================
  // Reps Leaderboard
  // ==========================================
  function renderRepsLeaderboard() {
    const listEl = document.getElementById('repsLeaderboard');
    if (!listEl) return;

    const currentList = getPeriodTransactions().filter(t => t.status !== 'Refunded');

    const repMap = {};
    currentList.forEach(t => {
      const name = t.rep || 'Unknown Rep';
      if (!repMap[name]) {
        repMap[name] = { name, revenue: 0, deals: 0 };
      }
      repMap[name].revenue += t.amount;
      repMap[name].deals += 1;
    });

    const reps = Object.values(repMap).sort((a, b) => b.revenue - a.revenue);
    const maxRepRevenue = reps.length > 0 ? reps[0].revenue : 1;

    const countBadge = document.getElementById('repCountBadge');
    if (countBadge) countBadge.textContent = reps.length + ' Reps Active';

    if (reps.length === 0) {
      listEl.innerHTML = '<div style="color: #64748b; font-size: 13px; text-align: center; padding: 24px 0;">No sales rep data recorded yet.</div>';
      return;
    }

    listEl.innerHTML = reps.map(rep => {
      const initials = rep.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      const pctOfTop = Math.round((rep.revenue / maxRepRevenue) * 100);

      return `
        <div class="rep-card-item">
          <div class="rep-avatar">${initials}</div>
          <div class="rep-info-wrap">
            <div class="rep-name-row">
              <span class="rep-name">${rep.name}</span>
              <span class="rep-revenue-amount">${formatCurrency(rep.revenue)}</span>
            </div>
            <div class="rep-progress-bar-bg">
              <div class="rep-progress-bar-val" style="width: ${pctOfTop}%;"></div>
            </div>
            <div class="rep-sub-meta">
              <span>${rep.deals} deals closed</span>
              <span>Quota Share: ${pctOfTop}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // Transaction Table: Filtering, Sorting & Pagination
  // ==========================================
  function filterAndSortTransactions() {
    let list = [...state.transactions];

    // Period filter
    const threshold = getPeriodDateThreshold(state.currentPeriod);
    if (threshold > 0) {
      list = list.filter(t => t.timestamp >= threshold);
    }

    // Category filter
    if (state.filterCategory !== 'all') {
      list = list.filter(t => t.category === state.filterCategory);
    }

    // Status filter
    if (state.filterStatus !== 'all') {
      list = list.filter(t => t.status === state.filterStatus);
    }

    // Search query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(t => {
        return (
          t.id.toLowerCase().includes(q) ||
          t.customer.toLowerCase().includes(q) ||
          t.product.toLowerCase().includes(q) ||
          t.rep.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[state.sortColumn];
      let valB = b[state.sortColumn];

      if (state.sortColumn === 'date') {
        valA = a.timestamp;
        valB = b.timestamp;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    state.filteredTransactions = list;

    // Reset pagination if out of bounds
    const maxPage = Math.max(1, Math.ceil(list.length / ROWS_PER_PAGE));
    if (state.currentPage > maxPage) {
      state.currentPage = maxPage;
    }
  }

  function renderTable() {
    filterAndSortTransactions();

    const tbody = document.getElementById('salesTableBody');
    const info = document.getElementById('paginationInfo');
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');

    if (!tbody) return;

    const list = state.filteredTransactions;
    const totalRecords = list.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE));
    const startIdx = (state.currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = Math.min(startIdx + ROWS_PER_PAGE, totalRecords);
    const pageRecords = list.slice(startIdx, endIdx);

    // Update Pagination Info
    if (info) {
      if (totalRecords === 0) {
        info.textContent = 'No matching transactions found';
      } else {
        info.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalRecords} transactions`;
      }
    }

    // Update Table Header Sort Indicators
    document.querySelectorAll('.sales-table th.sortable').forEach(th => {
      const col = th.dataset.sort;
      const icon = th.querySelector('.sort-icon');
      if (icon) {
        if (state.sortColumn === col) {
          icon.textContent = state.sortDirection === 'asc' ? ' ▲' : ' ▼';
          icon.style.color = '#2563eb';
        } else {
          icon.textContent = ' ⇕';
          icon.style.color = '#94a3b8';
        }
      }
    });

    // Render Page Number Buttons
    if (paginationNumbers) {
      paginationNumbers.innerHTML = '';
      for (let p = 1; p <= totalPages; p++) {
        const pBtn = document.createElement('button');
        pBtn.className = 'page-num-btn ' + (p === state.currentPage ? 'active' : '');
        pBtn.textContent = p;
        pBtn.addEventListener('click', () => {
          state.currentPage = p;
          renderTable();
        });
        paginationNumbers.appendChild(pBtn);
      }
    }

    // Render Rows
    if (pageRecords.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="empty-table-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" style="margin-bottom: 8px;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>No transactions match your current search and filters.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pageRecords.map(item => {
      const statusClass = item.status === 'Completed' ? 'status-completed' :
                          item.status === 'Pending' ? 'status-pending' : 'status-refunded';

      return `
        <tr>
          <td><strong style="color: #2563eb; font-weight: 700;">${item.id}</strong></td>
          <td>${formatDate(item.date)}</td>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${item.customer}</div>
            <div style="font-size: 11px; color: #94a3b8;">${item.email}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${item.product}</div>
            <div style="font-size: 11px; color: #64748b;">Qty: ${item.quantity} ${item.discount > 0 ? '(-' + item.discount + '%)' : ''}</div>
          </td>
          <td><span class="badge-neutral">${item.category}</span></td>
          <td>${item.rep}</td>
          <td class="text-right" style="font-weight: 700; color: #0f172a;">${formatCurrency(item.amount)}</td>
          <td class="text-right" style="font-weight: 600; color: ${item.profit >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(item.profit)}</td>
          <td class="text-center">
            <span class="status-pill ${statusClass}">${item.status}</span>
          </td>
          <td class="text-center">
            <div class="table-actions">
              <button class="btn-action-icon btn-action-view" data-id="${item.id}" title="View Details">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="btn-action-icon btn-action-edit" data-id="${item.id}" title="Edit Sale">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-action-icon btn-action-delete" data-id="${item.id}" title="Delete Record">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button events
    tbody.querySelectorAll('.btn-action-view').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditSaleModal(btn.dataset.id));
    });

    tbody.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });
  }

  // ==========================================
  // Master Render Dashboard
  // ==========================================
  function refreshDashboard() {
    renderKPIs();
    renderTrendChart();
    renderCategoryDonutChart();
    renderChannelBarChart();
    renderRepsLeaderboard();
    renderTable();

    const notice = document.getElementById('lastUpdatedNotice');
    if (notice) {
      const now = new Date();
      notice.textContent = 'Synchronized with local storage • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  // ==========================================
  // Modals: Add / Edit Transaction
  // ==========================================
  function updateModalCalcPreview() {
    const unitPrice = parseFloat(document.getElementById('formUnitPrice').value) || 0;
    const quantity = parseInt(document.getElementById('formQuantity').value, 10) || 1;
    const discount = parseFloat(document.getElementById('formDiscount').value) || 0;
    const cogsRate = (parseFloat(document.getElementById('formCostRate').value) || 0) / 100;

    const gross = Math.round(unitPrice * quantity * (1 - discount / 100) * 100) / 100;
    const cost = Math.round(gross * cogsRate * 100) / 100;
    const net = Math.round((gross - cost) * 100) / 100;

    document.getElementById('previewGrossAmount').textContent = formatCurrency(gross);
    document.getElementById('previewCostAmount').textContent = formatCurrency(cost);
    document.getElementById('previewNetAmount').textContent = formatCurrency(net);
  }

  function openAddSaleModal() {
    state.editingTransactionId = null;
    const form = document.getElementById('saleForm');
    if (form) form.reset();

    document.getElementById('saleModalTitle').textContent = 'Record New Transaction';
    document.getElementById('editTransactionId').value = '';
    document.getElementById('formSalesDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('formUnitPrice').value = '';
    document.getElementById('formQuantity').value = '1';
    document.getElementById('formCostRate').value = '25';
    document.getElementById('formDiscount').value = '0';

    updateModalCalcPreview();

    const modal = document.getElementById('addSaleModal');
    if (modal) modal.style.display = 'flex';
  }

  function openEditSaleModal(id) {
    const item = state.transactions.find(t => t.id === id);
    if (!item) return;

    state.editingTransactionId = id;
    document.getElementById('saleModalTitle').textContent = 'Edit Transaction (' + item.id + ')';
    document.getElementById('editTransactionId').value = item.id;
    document.getElementById('formCustomerName').value = item.customer;
    document.getElementById('formCustomerEmail').value = item.email;
    document.getElementById('formCategory').value = item.category;
    document.getElementById('formProductName').value = item.product;
    document.getElementById('formSalesDate').value = item.date;
    document.getElementById('formUnitPrice').value = item.unitPrice;
    document.getElementById('formQuantity').value = item.quantity;
    document.getElementById('formDiscount').value = item.discount;
    
    // Calculate approximate cost rate
    const cogsRate = item.amount > 0 ? Math.round((item.cost / item.amount) * 100) : 25;
    document.getElementById('formCostRate').value = cogsRate;

    document.getElementById('formSalesRep').value = item.rep;
    document.getElementById('formChannel').value = item.channel;
    document.getElementById('formRegion').value = item.region;
    document.getElementById('formStatus').value = item.status;

    updateModalCalcPreview();

    const modal = document.getElementById('addSaleModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeSaleModal() {
    const modal = document.getElementById('addSaleModal');
    if (modal) modal.style.display = 'none';
  }

  function handleSaleFormSubmit(e) {
    e.preventDefault();

    const customer = document.getElementById('formCustomerName').value.trim();
    const email = document.getElementById('formCustomerEmail').value.trim();
    const category = document.getElementById('formCategory').value;
    const product = document.getElementById('formProductName').value.trim();
    const date = document.getElementById('formSalesDate').value;
    const unitPrice = parseFloat(document.getElementById('formUnitPrice').value) || 0;
    const quantity = parseInt(document.getElementById('formQuantity').value, 10) || 1;
    const discount = parseFloat(document.getElementById('formDiscount').value) || 0;
    const cogsRate = (parseFloat(document.getElementById('formCostRate').value) || 0) / 100;
    const rep = document.getElementById('formSalesRep').value;
    const channel = document.getElementById('formChannel').value;
    const region = document.getElementById('formRegion').value;
    const status = document.getElementById('formStatus').value;

    if (!customer || !email || !product || !date || unitPrice <= 0) {
      showToast('Please fill in all required fields with valid values', 'error');
      return;
    }

    const gross = Math.round(unitPrice * quantity * (1 - discount / 100) * 100) / 100;
    const cost = Math.round(gross * cogsRate * 100) / 100;
    const profit = status === 'Refunded' ? -cost : Math.round((gross - cost) * 100) / 100;
    const timestamp = new Date(date).getTime();

    if (state.editingTransactionId) {
      // Edit existing
      const idx = state.transactions.findIndex(t => t.id === state.editingTransactionId);
      if (idx !== -1) {
        state.transactions[idx] = {
          ...state.transactions[idx],
          customer,
          email,
          category,
          product,
          date,
          timestamp,
          unitPrice,
          quantity,
          discount,
          amount: gross,
          cost,
          profit,
          rep,
          channel,
          region,
          status
        };
        showToast('Transaction ' + state.editingTransactionId + ' updated successfully', 'success');
      }
    } else {
      // Create new
      const nextId = 'INV-' + (1000 + state.transactions.length + 1);
      state.transactions.unshift({
        id: nextId,
        date,
        timestamp,
        customer,
        email,
        category,
        product,
        unitPrice,
        quantity,
        discount,
        amount: gross,
        cost,
        profit,
        rep,
        channel,
        region,
        status
      });
      showToast('New sale ' + nextId + ' recorded', 'success');
    }

    saveTransactions();
    closeSaleModal();
    refreshDashboard();
  }

  function deleteTransaction(id) {
    if (confirm(`Are you sure you want to permanently delete transaction ${id}?`)) {
      state.transactions = state.transactions.filter(t => t.id !== id);
      saveTransactions();
      refreshDashboard();
      showToast(`Transaction ${id} deleted`, 'info');
    }
  }

  // ==========================================
  // Modal: View Transaction Details
  // ==========================================
  function openDetailsModal(id) {
    const item = state.transactions.find(t => t.id === id);
    if (!item) return;

    document.getElementById('detailInvoiceTitle').textContent = `Transaction ${item.id}`;
    document.getElementById('detailInvoiceSubtitle').textContent = `Recorded on ${formatDate(item.date)}`;

    const body = document.getElementById('detailModalBody');
    if (!body) return;

    const statusBadgeClass = item.status === 'Completed' ? 'status-completed' :
                             item.status === 'Pending' ? 'status-pending' : 'status-refunded';

    body.innerHTML = `
      <div class="detail-table-card">
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="status-pill ${statusBadgeClass}">${item.status}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Customer</span>
          <span class="detail-val">${item.customer} (${item.email})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Product / Service</span>
          <span class="detail-val">${item.product}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category</span>
          <span class="detail-val">${item.category}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sales Representative</span>
          <span class="detail-val">${item.rep}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Acquisition Channel</span>
          <span class="detail-val">${item.channel}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Region</span>
          <span class="detail-val">${item.region}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit Price & Quantity</span>
          <span class="detail-val">${formatCurrency(item.unitPrice)} &times; ${item.quantity}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Discount Applied</span>
          <span class="detail-val">${item.discount}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estimated COGS</span>
          <span class="detail-val">${formatCurrency(item.cost)}</span>
        </div>
        <div class="detail-row" style="border-bottom: none; font-size: 15px; margin-top: 4px;">
          <span class="detail-label" style="font-weight: 700; color: #0f172a;">Total Revenue</span>
          <span class="detail-val" style="color: #2563eb; font-weight: 800; font-size: 16px;">${formatCurrency(item.amount)}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label" style="font-weight: 700; color: #0f172a;">Calculated Net Profit</span>
          <span class="detail-val" style="color: #059669; font-weight: 800;">${formatCurrency(item.profit)}</span>
        </div>
      </div>
    `;

    const modal = document.getElementById('viewDetailsModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeDetailsModal() {
    const modal = document.getElementById('viewDetailsModal');
    if (modal) modal.style.display = 'none';
  }

  // ==========================================
  // CSV Export Engine
  // ==========================================
  function exportCSV() {
    filterAndSortTransactions();
    const list = state.filteredTransactions;
    if (list.length === 0) {
      showToast('No records available to export', 'error');
      return;
    }

    const headers = ['Invoice ID', 'Date', 'Customer', 'Email', 'Category', 'Product', 'Unit Price', 'Quantity', 'Discount %', 'Revenue', 'Cost', 'Net Profit', 'Sales Rep', 'Channel', 'Region', 'Status'];
    const rows = list.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.customer.replace(/"/g, '""')}"`,
      `"${t.email.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.product.replace(/"/g, '""')}"`,
      t.unitPrice,
      t.quantity,
      t.discount,
      t.amount,
      t.cost,
      t.profit,
      `"${t.rep.replace(/"/g, '""')}"`,
      `"${t.channel.replace(/"/g, '""')}"`,
      `"${t.region.replace(/"/g, '""')}"`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${list.length} transactions as CSV`, 'success');
  }

  // ==========================================
  // Event Listeners & Initialization
  // ==========================================
  function attachEventListeners() {
    // Period Dropdown
    const periodSelect = document.getElementById('timeRangeSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', e => {
        state.currentPeriod = e.target.value;
        refreshDashboard();
      });
    }

    // Sidebar Nav Items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
      link.addEventListener('click', e => {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // Channel/Region Toggle
    document.querySelectorAll('.channel-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.channel-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.secondaryChartView = btn.dataset.view;
        renderChannelBarChart();
      });
    });

    // Modal Triggers
    const btnOpenAdd = document.getElementById('btnOpenAddSaleModal');
    if (btnOpenAdd) btnOpenAdd.addEventListener('click', openAddSaleModal);

    const btnCloseSale = document.getElementById('btnCloseSaleModal');
    if (btnCloseSale) btnCloseSale.addEventListener('click', closeSaleModal);

    const btnCancelSale = document.getElementById('btnCancelSaleModal');
    if (btnCancelSale) btnCancelSale.addEventListener('click', closeSaleModal);

    const saleForm = document.getElementById('saleForm');
    if (saleForm) {
      saleForm.addEventListener('submit', handleSaleFormSubmit);
      // Live calculation updates
      ['formUnitPrice', 'formQuantity', 'formDiscount', 'formCostRate'].forEach(id => {
        const inp = document.getElementById(id);
        if (inp) inp.addEventListener('input', updateModalCalcPreview);
      });
    }

    // Details Modal Close
    const btnCloseDetail = document.getElementById('btnCloseDetailModal');
    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeDetailsModal);

    const btnCloseDetailFoot = document.getElementById('btnCloseDetailFooterBtn');
    if (btnCloseDetailFoot) btnCloseDetailFoot.addEventListener('click', closeDetailsModal);

    // CSV Export
    const btnExport = document.getElementById('btnExportCSV');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    // Reset / Demo Data Seed
    const btnSeed = document.getElementById('btnSeedDemo');
    if (btnSeed) {
      btnSeed.addEventListener('click', () => {
        if (confirm('Reset and load standard sales demo dataset? Your existing additions will be restored to default.')) {
          state.transactions = generateDemoDataset();
          saveTransactions();
          refreshDashboard();
          showToast('Demo sales dataset initialized', 'success');
        }
      });
    }

    // Search Input
    const searchInput = document.getElementById('transactionSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value;
        state.currentPage = 1;
        if (clearSearchBtn) clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        renderTable();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        state.currentPage = 1;
        renderTable();
      });
    }

    // Filters
    const filterCat = document.getElementById('filterCategory');
    if (filterCat) {
      filterCat.addEventListener('change', e => {
        state.filterCategory = e.target.value;
        state.currentPage = 1;
        renderTable();
      });
    }

    const filterStat = document.getElementById('filterStatus');
    if (filterStat) {
      filterStat.addEventListener('change', e => {
        state.filterStatus = e.target.value;
        state.currentPage = 1;
        renderTable();
      });
    }

    const btnResetFilters = document.getElementById('btnResetFilters');
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', () => {
        state.searchQuery = '';
        state.filterCategory = 'all';
        state.filterStatus = 'all';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        if (filterCat) filterCat.value = 'all';
        if (filterStat) filterStat.value = 'all';
        state.currentPage = 1;
        renderTable();
        showToast('Table filters reset', 'info');
      });
    }

    // Table Column Sorting
    document.querySelectorAll('.sales-table th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (state.sortColumn === col) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = col;
          state.sortDirection = 'desc';
        }
        renderTable();
      });
    });

    // Pagination Buttons
    const btnPrev = document.getElementById('btnPrevPage');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderTable();
        }
      });
    }

    const btnNext = document.getElementById('btnNextPage');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const maxPage = Math.ceil(state.filteredTransactions.length / ROWS_PER_PAGE);
        if (state.currentPage < maxPage) {
          state.currentPage++;
          renderTable();
        }
      });
    }

    // Close Modals on backdrop click or ESC key
    window.addEventListener('click', e => {
      const addModal = document.getElementById('addSaleModal');
      const viewModal = document.getElementById('viewDetailsModal');
      if (e.target === addModal) closeSaleModal();
      if (e.target === viewModal) closeDetailsModal();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeSaleModal();
        closeDetailsModal();
      }
    });

    // Responsive Canvas Resize
    window.addEventListener('resize', () => {
      renderTrendChart();
      renderCategoryDonutChart();
      renderChannelBarChart();
    });

    // Setup Canvas Tooltips
    setupTrendChartHover();
    setupDonutChartHover();
    setupChannelBarHover();
  }

  // ==========================================
  // Initialization
  // ==========================================
  function init() {
    loadTransactions();
    attachEventListeners();
    refreshDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

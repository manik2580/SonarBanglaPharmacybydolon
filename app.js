// Check if user is logged in
if (!sessionStorage.getItem("isLoggedIn")) {
  window.location.href = "login.html"
}

// Toast notification function
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container")
  const toast = document.createElement("div")
  toast.className = `toast ${type}`

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }

  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `

  container.appendChild(toast)

  setTimeout(() => {
    toast.classList.add("show")
  }, 10)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      container.removeChild(toast)
    }, 300)
  }, 3000)
}

// Shop Manager Class
class ShopManager {
  constructor() {
    this.products = []
    this.sales = []
    this.procurements = []
    this.currentSale = []
    this.currentProcurement = []
    this.settings = {
      shopName: "Sonar Bangla Pharmacy",
      shopAddress: "Idelpur, Sadullahpur, Gaibandha",
      shopPhone: "01707459702",
      lowStockThreshold: 10,
      currency: "৳",
      darkMode: "light",
    }

    this.init()
  }

  init() {
    this.loadData()
    this.initializeEventListeners()
    this.updateDateTime()
    this.updateDashboard()
    this.loadInventory()
    this.loadStatements()
    this.initializeDarkMode()

    setInterval(() => this.updateDateTime(), 1000)
  }

  initializeDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle")
    const darkModePreference = document.getElementById("darkModePreference")

    if (darkModePreference) {
      darkModePreference.value = this.settings.darkMode || "light"
    }

    this.applyTheme(this.settings.darkMode || "light")

    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme")
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        this.settings.darkMode = newTheme
        this.applyTheme(newTheme)
        this.saveData()

        if (darkModePreference) {
          darkModePreference.value = newTheme
        }
      })
    }

    if (darkModePreference) {
      darkModePreference.addEventListener("change", (e) => {
        this.settings.darkMode = e.target.value
        this.applyTheme(e.target.value)
        this.saveData()
      })
    }
  }

  applyTheme(theme) {
    const root = document.documentElement
    const darkModeToggle = document.getElementById("darkModeToggle")

    if (theme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      theme = prefersDark ? "dark" : "light"
    }

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark")
      if (darkModeToggle) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
        darkModeToggle.title = "Switch to Light Mode"
      }
    } else {
      root.setAttribute("data-theme", "light")
      if (darkModeToggle) {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
        darkModeToggle.title = "Switch to Dark Mode"
      }
    }
  }

  loadData() {
    const savedProducts = localStorage.getItem("shop_products")
    const savedSales = localStorage.getItem("shop_sales")
    const savedProcurements = localStorage.getItem("shop_procurements")
    const savedSettings = localStorage.getItem("shop_settings")

    if (savedProducts) this.products = JSON.parse(savedProducts)
    if (savedSales) this.sales = JSON.parse(savedSales)
    if (savedProcurements) this.procurements = JSON.parse(savedProcurements)
    if (savedSettings) this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
  }

  saveData() {
    localStorage.setItem("shop_products", JSON.stringify(this.products))
    localStorage.setItem("shop_sales", JSON.stringify(this.sales))
    localStorage.setItem("shop_procurements", JSON.stringify(this.procurements))
    localStorage.setItem("shop_settings", JSON.stringify(this.settings))
  }

  loadSampleData() {
    console.warn("Sample data loading has been removed.")
  }

  resetAllData() {
    localStorage.clear()
    this.products = []
    this.sales = []
    this.procurements = []
    this.currentSale = []
    this.currentProcurement = []
    this.settings = {
      shopName: "Sonar Bangla Pharmacy",
      shopAddress: "Idelpur, Sadullahpur, Gaibandha",
      shopPhone: "01707459702",
      lowStockThreshold: 10,
      currency: "৳",
      darkMode: "light",
    }

    this.updateDashboard()
    this.loadInventory()
    this.loadStatements()
    this.updateCurrencySymbols()
    this.applyTheme("light")
    showToast("All data has been reset successfully!", "success")
  }

  initializeEventListeners() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const section = item.dataset.section
        this.showSection(section)
      })
    })

    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("isLoggedIn")
        window.location.href = "login.html"
      })
    }

    this.initSalesEventListeners()
    this.initProcurementEventListeners()
    this.initInventoryEventListeners()
    this.initStatementsEventListeners()
    this.initSettingsEventListeners()
    this.initModalEventListeners()
  }

  initSalesEventListeners() {
    const productSearch = document.getElementById("productSearch")
    const saleQuantity = document.getElementById("saleQuantity")
    const addToSaleBtn = document.getElementById("addToSale")
    const completeSaleBtn = document.getElementById("completeSale")
    const clearSaleBtn = document.getElementById("clearSale")
    const decreaseQtyBtn = document.getElementById("decreaseQty")
    const increaseQtyBtn = document.getElementById("increaseQty")
    const searchMethods = document.querySelectorAll(".search-method")
    const receivedAmountInput = document.getElementById("receivedAmount")

    searchMethods.forEach((method) => {
      method.addEventListener("click", () => {
        searchMethods.forEach((m) => m.classList.remove("active"))
        method.classList.add("active")

        const searchType = method.dataset.method
        const searchLabel = document.getElementById("searchMethodLabel")
        const searchInput = document.getElementById("productSearch")

        if (searchType === "name") {
          searchLabel.textContent = "Enter Product Name:"
          searchInput.placeholder = "Type product name to search..."
        } else {
          searchLabel.textContent = "Enter Barcode:"
          searchInput.placeholder = "Scan or type barcode..."
        }

        searchInput.value = ""
        document.getElementById("productSuggestions").style.display = "none"
        document.getElementById("productDetails").style.display = "none"
      })
    })

    productSearch.addEventListener("input", (e) => {
      this.handleEnhancedProductSearch(e.target.value, "sales")
    })

    decreaseQtyBtn.addEventListener("click", () => {
      const currentQty = Number.parseInt(saleQuantity.value) || 1
      if (currentQty > 1) {
        saleQuantity.value = currentQty - 1
        this.updateSaleLineTotal()
      }
    })

    increaseQtyBtn.addEventListener("click", () => {
      const currentQty = Number.parseInt(saleQuantity.value) || 1
      const maxQty = Number.parseInt(saleQuantity.max) || 999
      if (currentQty < maxQty) {
        saleQuantity.value = currentQty + 1
        this.updateSaleLineTotal()
      }
    })

    saleQuantity.addEventListener("input", () => {
      this.updateSaleLineTotal()
    })

    receivedAmountInput.addEventListener("input", () => {
      this.updateChangeCalculation()
    })

    addToSaleBtn.addEventListener("click", () => {
      this.addToCurrentSale()
    })

    completeSaleBtn.addEventListener("click", () => {
      this.completeSale()
    })

    clearSaleBtn.addEventListener("click", () => {
      this.clearCurrentSale()
    })

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        const barcode = e.target.dataset.barcode
        const module = e.target.dataset.module
        this.selectProduct(barcode, module)
      }
    })
  }

  initProcurementEventListeners() {
    const procurementSearch = document.getElementById("procurementSearch")
    const addNewProductBtn = document.getElementById("addNewProduct")
    const addToProcurementBtn = document.getElementById("addToProcurement")
    const completeProcurementBtn = document.getElementById("completeProcurement")
    const clearProcurementBtn = document.getElementById("clearProcurement")

    const procurementSearchMethods = document.querySelectorAll('.search-method[data-module="procurement"]')
    procurementSearchMethods.forEach((method) => {
      method.addEventListener("click", () => {
        procurementSearchMethods.forEach((m) => m.classList.remove("active"))
        method.classList.add("active")

        const methodType = method.dataset.method
        const label = document.getElementById("procurementSearchMethodLabel")
        const input = document.getElementById("procurementSearch")

        if (methodType === "name") {
          label.textContent = "Enter Product Name:"
          input.placeholder = "Type product name to search..."
        } else {
          label.textContent = "Enter Barcode:"
          input.placeholder = "Type barcode to search..."
        }

        input.value = ""
        document.getElementById("procurementSuggestions").style.display = "none"
      })
    })

    procurementSearch.addEventListener("input", (e) => {
      this.handleProductSearch(e.target.value, "procurement")
    })

    addNewProductBtn.addEventListener("click", () => {
      this.showModal("newProductModal")
      setTimeout(() => {
        document.getElementById("newBarcode").focus()
      }, 100)
    })

    addToProcurementBtn.addEventListener("click", () => {
      this.addToProcurementBatch()
    })

    completeProcurementBtn.addEventListener("click", () => {
      this.completeProcurement()
    })

    clearProcurementBtn.addEventListener("click", () => {
      this.clearProcurementBatch()
    })

    const decreaseProcQty = document.getElementById("decreaseProcQty")
    const increaseProcQty = document.getElementById("increaseProcQty")
    const procQuantityInput = document.getElementById("procQuantity")

    if (decreaseProcQty) {
      decreaseProcQty.addEventListener("click", () => {
        const currentValue = Number.parseInt(procQuantityInput.value) || 1
        if (currentValue > 1) {
          procQuantityInput.value = currentValue - 1
          this.updateProcurementLineTotal()
        }
      })
    }

    if (increaseProcQty) {
      increaseProcQty.addEventListener("click", () => {
        const currentValue = Number.parseInt(procQuantityInput.value) || 1
        procQuantityInput.value = currentValue + 1
        this.updateProcurementLineTotal()
      })
    }
    ;["procQuantity", "procPurchasePrice"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        this.updateProcurementLineTotal()
      })
    })
  }

  initInventoryEventListeners() {
    const inventorySearch = document.getElementById("inventorySearch")
    const inventoryFilter = document.getElementById("inventoryFilter")

    inventorySearch.addEventListener("input", (e) => {
      this.loadInventory(e.target.value, inventoryFilter.value)
    })

    inventoryFilter.addEventListener("change", (e) => {
      this.loadInventory(inventorySearch.value, e.target.value)
    })
  }

  initStatementsEventListeners() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tabId = btn.dataset.tab
        this.showTab(tabId)
      })
    })

    document.getElementById("generateSalesRange").addEventListener("click", () => {
      this.generateSalesRangeReport()
    })

    document.getElementById("generateProcurementRange").addEventListener("click", () => {
      this.generateProcurementRangeReport()
    })

    this.initPrintExportListeners()
  }

  initPrintExportListeners() {
    document.getElementById("printDailySales").addEventListener("click", () => {
      this.printStatement("daily-sales")
    })
    document.getElementById("printRangeSales").addEventListener("click", () => {
      this.printStatement("range-sales")
    })
    document.getElementById("printDailyProcurement").addEventListener("click", () => {
      this.printStatement("daily-procurement")
    })
    document.getElementById("printRangeProcurement").addEventListener("click", () => {
      this.printStatement("range-procurement")
    })

    document.getElementById("exportDailySales").addEventListener("click", () => {
      this.exportToCSV("daily-sales")
    })
    document.getElementById("exportRangeSales").addEventListener("click", () => {
      this.exportToCSV("range-sales")
    })
    document.getElementById("exportDailyProcurement").addEventListener("click", () => {
      this.exportToCSV("daily-procurement")
    })
    document.getElementById("exportRangeProcurement").addEventListener("click", () => {
      this.exportToCSV("range-procurement")
    })
  }

  initSettingsEventListeners() {
    document.getElementById("saveSettings").addEventListener("click", () => {
      this.saveSettings()
    })

    document.querySelector('[data-section="settings"]').addEventListener("click", () => {
      this.loadSettingsValues()
    })

    document.getElementById("resetData").addEventListener("click", () => {
      this.showResetConfirmModal()
    })
  }

  initModalEventListeners() {
    document.querySelectorAll(".close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal")
        this.hideModal(modal.id)
      })
    })

    document.getElementById("saveNewProduct").addEventListener("click", () => {
      this.saveNewProduct()
    })

    document.getElementById("cancelNewProduct").addEventListener("click", () => {
      this.hideModal("newProductModal")
    })

    document.getElementById("decreaseNewQty").addEventListener("click", () => {
      const input = document.getElementById("newQuantity")
      const currentValue = Number.parseInt(input.value) || 0
      if (currentValue > 0) {
        input.value = currentValue - 1
      }
    })

    document.getElementById("increaseNewQty").addEventListener("click", () => {
      const input = document.getElementById("newQuantity")
      const currentValue = Number.parseInt(input.value) || 0
      input.value = currentValue + 1
    })

    const purchasePriceInput = document.getElementById("newPurchasePrice")
    const sellingPriceInput = document.getElementById("newSellingPrice")

    purchasePriceInput.addEventListener("input", () => {
      this.calculateNewProductProfit()
    })

    sellingPriceInput.addEventListener("input", () => {
      this.calculateNewProductProfit()
    })

    this.initReceiptListeners()

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.hideModal(e.target.id)
      }
    })
  }

  showSection(sectionId) {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active")

    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active")
    })
    document.getElementById(sectionId).classList.add("active")

    if (sectionId === "statements") {
      this.loadStatements()
    } else if (sectionId === "inventory") {
      this.loadInventory()
    } else if (sectionId === "settings") {
      this.loadSettingsValues()
    }
  }

  showTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active")

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.getElementById(tabId).classList.add("active")
  }

  showModal(modalId) {
    document.getElementById(modalId).style.display = "block"
  }

  hideModal(modalId) {
    document.getElementById(modalId).style.display = "none"
  }

  updateDateTime() {
    const now = new Date()
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
    document.getElementById("currentDateTime").textContent = now.toLocaleString("en-US", options)
  }

  updateDashboard() {
    const today = new Date().toDateString()
    const todaySales = this.sales.filter((sale) => new Date(sale.timestamp).toDateString() === today)

    let totalSales = 0
    let totalProfit = 0
    const totalTransactions = todaySales.length

    todaySales.forEach((sale) => {
      sale.items.forEach((item) => {
        totalSales += item.total
        totalProfit += (item.sellingPrice - item.purchasePrice) * item.quantity
      })
    })

    const lowStockProducts = this.products.filter(
      (p) => p.quantity <= this.settings.lowStockThreshold && p.quantity > 0,
    )

    document.getElementById("todaySales").textContent = this.formatCurrency(totalSales)
    document.getElementById("totalTransactions").textContent = totalTransactions
    document.getElementById("todayProfit").textContent = this.formatCurrency(totalProfit)
    document.getElementById("lowStockCount").textContent = lowStockProducts.length

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlySales = this.sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp)
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
    })

    const monthlyProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate.getMonth() === currentMonth && procDate.getFullYear() === currentYear
    })

    let monthlySalesTotal = 0
    let monthlyProfitTotal = 0
    const monthlyTransactionsCount = monthlySales.length

    monthlySales.forEach((sale) => {
      sale.items.forEach((item) => {
        monthlySalesTotal += item.total
        monthlyProfitTotal += (item.sellingPrice - item.purchasePrice) * item.quantity
      })
    })

    let monthlyPurchasesTotal = 0
    monthlyProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        monthlyPurchasesTotal += item.total
      })
    })

    document.getElementById("monthlySales").textContent = this.formatCurrency(monthlySalesTotal)
    document.getElementById("monthlyProfit").textContent = this.formatCurrency(monthlyProfitTotal)
    document.getElementById("monthlyPurchases").textContent = this.formatCurrency(monthlyPurchasesTotal)
    document.getElementById("monthlyTransactions").textContent = monthlyTransactionsCount
  }

  formatCurrency(amount) {
    return `${this.settings.currency}${amount.toFixed(2)}`
  }

  updateCurrencySymbols() {
    document.querySelectorAll(".currency-symbol").forEach((el) => {
      el.textContent = this.settings.currency
    })
  }

  handleEnhancedProductSearch(searchTerm, module) {
    const suggestionsContainer = document.getElementById(
      module === "sales" ? "productSuggestions" : "procurementSuggestions",
    )

    if (!searchTerm.trim()) {
      suggestionsContainer.style.display = "none"
      return
    }

    const activeMethod = document.querySelector(
      module === "sales" ? ".search-method.active" : '.search-method.active[data-module="procurement"]',
    )
    const searchMethod = activeMethod ? activeMethod.dataset.method : "name"

    let filteredProducts = []
    if (searchMethod === "barcode") {
      filteredProducts = this.products.filter((p) => p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    } else {
      filteredProducts = this.products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (filteredProducts.length === 0) {
      suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No products found</div>'
      suggestionsContainer.style.display = "block"
      return
    }

    suggestionsContainer.innerHTML = filteredProducts
      .map(
        (product) => `
      <div class="suggestion-item" data-barcode="${product.barcode}" data-module="${module}">
        <strong>${product.name}</strong> - ${product.company}<br>
        <small>Barcode: ${product.barcode} | Stock: ${product.quantity} | Price: ${this.formatCurrency(product.sellingPrice)}</small>
      </div>
    `,
      )
      .join("")

    suggestionsContainer.style.display = "block"
  }

  handleProductSearch(searchTerm, module) {
    this.handleEnhancedProductSearch(searchTerm, module)
  }

  selectProduct(barcode, module) {
    const product = this.products.find((p) => p.barcode === barcode)
    if (!product) return

    if (module === "sales") {
      document.getElementById("productSearch").value = product.name
      document.getElementById("productSuggestions").style.display = "none"
      document.getElementById("selectedProductName").textContent = product.name
      document.getElementById("selectedProductStock").textContent = product.quantity
      document.getElementById("selectedProductPrice").textContent = this.formatCurrency(product.sellingPrice)
      document.getElementById("saleQuantity").value = 1
      document.getElementById("saleQuantity").max = product.quantity
      document.getElementById("productDetails").style.display = "block"
      this.updateSaleLineTotal()
    } else if (module === "procurement") {
      document.getElementById("procurementSearch").value = product.name
      document.getElementById("procurementSuggestions").style.display = "none"
      document.getElementById("procQuantity").value = 1
      document.getElementById("procPurchasePrice").value = product.purchasePrice
      document.getElementById("procSellingPrice").value = product.sellingPrice
      this.updateProcurementLineTotal()
    }
  }

  updateSaleLineTotal() {
    const product = this.products.find((p) => p.name === document.getElementById("selectedProductName").textContent)
    if (!product) return

    const quantity = Number.parseInt(document.getElementById("saleQuantity").value) || 1
    const lineTotal = product.sellingPrice * quantity
    document.getElementById("lineTotal").textContent = this.formatCurrency(lineTotal)
  }

  updateProcurementLineTotal() {
    const quantity = Number.parseInt(document.getElementById("procQuantity").value) || 1
    const purchasePrice = Number.parseFloat(document.getElementById("procPurchasePrice").value) || 0
    const lineTotal = quantity * purchasePrice
    document.getElementById("procLineTotal").textContent = this.formatCurrency(lineTotal)
  }

  addToCurrentSale() {
    const productName = document.getElementById("selectedProductName").textContent
    const product = this.products.find((p) => p.name === productName)

    if (!product) {
      showToast("Please select a product first", "error")
      return
    }

    const quantity = Number.parseInt(document.getElementById("saleQuantity").value)

    if (quantity > product.quantity) {
      showToast("Insufficient stock available", "error")
      return
    }

    const existingItem = this.currentSale.find((item) => item.barcode === product.barcode)

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.total = existingItem.quantity * existingItem.sellingPrice
    } else {
      this.currentSale.push({
        barcode: product.barcode,
        name: product.name,
        quantity: quantity,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        total: quantity * product.sellingPrice,
      })
    }

    this.renderSaleItems()
    document.getElementById("productDetails").style.display = "none"
    document.getElementById("productSearch").value = ""
    showToast("Product added to sale", "success")
  }

  renderSaleItems() {
    const tbody = document.querySelector("#saleItemsTable tbody")
    tbody.innerHTML = ""

    let grandTotal = 0

    this.currentSale.forEach((item, index) => {
      grandTotal += item.total

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(item.total)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="shopManager.removeFromSale(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
    })

    document.getElementById("saleGrandTotal").textContent = this.formatCurrency(grandTotal)
    this.updateChangeCalculation()
  }

  updateChangeCalculation() {
    const grandTotal = this.currentSale.reduce((sum, item) => sum + item.total, 0)
    const receivedAmount = Number.parseFloat(document.getElementById("receivedAmount").value) || 0

    if (receivedAmount > 0) {
      const change = receivedAmount - grandTotal

      document.getElementById("changeTotal").textContent = this.formatCurrency(grandTotal)
      document.getElementById("changeReceived").textContent = this.formatCurrency(receivedAmount)
      document.getElementById("changeAmount").textContent = this.formatCurrency(change)
      document.getElementById("changeDisplay").style.display = "block"
    } else {
      document.getElementById("changeDisplay").style.display = "none"
    }
  }

  removeFromSale(index) {
    this.currentSale.splice(index, 1)
    this.renderSaleItems()
  }

  completeSale() {
    if (this.currentSale.length === 0) {
      showToast("No items in current sale", "error")
      return
    }

    this.currentSale.forEach((item) => {
      const product = this.products.find((p) => p.barcode === item.barcode)
      if (product) {
        product.quantity -= item.quantity
      }
    })

    const sale = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: [...this.currentSale],
      total: this.currentSale.reduce((sum, item) => sum + item.total, 0),
    }

    this.sales.push(sale)
    this.saveData()
    this.generateReceipt(sale)
    this.currentSale = []
    this.renderSaleItems()
    this.updateDashboard()
    document.getElementById("receivedAmount").value = ""
    document.getElementById("changeDisplay").style.display = "none"
    showToast("Sale completed successfully!", "success")
  }

  clearCurrentSale() {
    this.currentSale = []
    this.renderSaleItems()
    document.getElementById("receivedAmount").value = ""
    document.getElementById("changeDisplay").style.display = "none"
    showToast("Sale cleared", "info")
  }

  generateReceipt(sale) {
    const receiptContent = document.getElementById("receiptContent")

    let itemsHTML = ""
    sale.items.forEach((item) => {
      itemsHTML += `
        <div class="receipt-item">
          <span>${item.name} x${item.quantity}</span>
          <span>${this.formatCurrency(item.total)}</span>
        </div>
      `
    })

    receiptContent.innerHTML = `
      <div class="receipt-header">
        <h2>${this.settings.shopName}</h2>
        <p>${this.settings.shopAddress}</p>
        <p>Phone: ${this.settings.shopPhone}</p>
        <p>Date: ${new Date(sale.timestamp).toLocaleString()}</p>
      </div>
      <div class="receipt-items">
        ${itemsHTML}
      </div>
      <div class="receipt-total">
        <strong>Total: ${this.formatCurrency(sale.total)}</strong>
      </div>
      <div class="receipt-footer">
        <p>Thank you for your purchase!</p>
        <p>Please visit again</p>
      </div>
    `

    this.showModal("receiptModal")
  }

  addToProcurementBatch() {
    const productName = document.getElementById("procurementSearch").value
    const product = this.products.find((p) => p.name === productName)

    if (!product) {
      showToast("Please select a valid product", "error")
      return
    }

    const quantity = Number.parseInt(document.getElementById("procQuantity").value)
    const purchasePrice = Number.parseFloat(document.getElementById("procPurchasePrice").value)
    const sellingPrice = Number.parseFloat(document.getElementById("procSellingPrice").value)

    if (quantity <= 0 || purchasePrice <= 0 || sellingPrice <= 0) {
      showToast("Please enter valid values", "error")
      return
    }

    const existingItem = this.currentProcurement.find((item) => item.barcode === product.barcode)

    if (existingItem) {
      existingItem.quantity += quantity
      existingItem.total = existingItem.quantity * existingItem.purchasePrice
    } else {
      this.currentProcurement.push({
        barcode: product.barcode,
        name: product.name,
        quantity: quantity,
        purchasePrice: purchasePrice,
        sellingPrice: sellingPrice,
        total: quantity * purchasePrice,
      })
    }

    this.renderProcurementItems()
    document.getElementById("procurementSearch").value = ""
    document.getElementById("procQuantity").value = 1
    document.getElementById("procPurchasePrice").value = ""
    document.getElementById("procSellingPrice").value = ""
    document.getElementById("procLineTotal").textContent = this.formatCurrency(0)
    showToast("Product added to procurement batch", "success")
  }

  renderProcurementItems() {
    const tbody = document.querySelector("#procurementTable tbody")
    tbody.innerHTML = ""

    let batchTotal = 0

    this.currentProcurement.forEach((item, index) => {
      batchTotal += item.total

      const row = tbody.insertRow()
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.purchasePrice)}</td>
        <td>${this.formatCurrency(item.sellingPrice)}</td>
        <td>${this.formatCurrency(item.total)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="shopManager.removeFromProcurement(${index})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
    })

    document.getElementById("procurementBatchTotal").textContent = this.formatCurrency(batchTotal)
  }

  removeFromProcurement(index) {
    this.currentProcurement.splice(index, 1)
    this.renderProcurementItems()
  }

  completeProcurement() {
    if (this.currentProcurement.length === 0) {
      showToast("No items in procurement batch", "error")
      return
    }

    this.currentProcurement.forEach((item) => {
      const product = this.products.find((p) => p.barcode === item.barcode)
      if (product) {
        product.quantity += item.quantity
        product.purchasePrice = item.purchasePrice
        product.sellingPrice = item.sellingPrice
      }
    })

    const procurement = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: [...this.currentProcurement],
      total: this.currentProcurement.reduce((sum, item) => sum + item.total, 0),
    }

    this.procurements.push(procurement)
    this.saveData()
    this.currentProcurement = []
    this.renderProcurementItems()
    this.updateDashboard()
    this.loadInventory()
    showToast("Procurement completed successfully!", "success")
  }

  clearProcurementBatch() {
    this.currentProcurement = []
    this.renderProcurementItems()
    showToast("Procurement batch cleared", "info")
  }

  saveNewProduct() {
    const barcode = document.getElementById("newBarcode").value.trim()
    const name = document.getElementById("newProductName").value.trim()
    const company = document.getElementById("newCompanyName").value.trim()
    const quantity = Number.parseInt(document.getElementById("newQuantity").value)
    const purchasePrice = Number.parseFloat(document.getElementById("newPurchasePrice").value)
    const sellingPrice = Number.parseFloat(document.getElementById("newSellingPrice").value)

    if (!barcode || !name || !company) {
      showToast("Please fill in all required fields", "error")
      return
    }

    if (this.products.find((p) => p.barcode === barcode)) {
      showToast("Product with this barcode already exists", "error")
      return
    }

    this.products.push({
      barcode,
      name,
      company,
      quantity,
      purchasePrice,
      sellingPrice,
    })

    this.saveData()
    this.loadInventory()
    this.hideModal("newProductModal")

    document.getElementById("newBarcode").value = ""
    document.getElementById("newProductName").value = ""
    document.getElementById("newCompanyName").value = ""
    document.getElementById("newQuantity").value = 0
    document.getElementById("newPurchasePrice").value = ""
    document.getElementById("newSellingPrice").value = ""

    showToast("New product added successfully!", "success")
  }

  calculateNewProductProfit() {
    const purchasePrice = Number.parseFloat(document.getElementById("newPurchasePrice").value) || 0
    const sellingPrice = Number.parseFloat(document.getElementById("newSellingPrice").value) || 0

    if (purchasePrice > 0 && sellingPrice > 0) {
      const profit = sellingPrice - purchasePrice
      const margin = ((profit / sellingPrice) * 100).toFixed(2)

      document.getElementById("expectedProfit").textContent = this.formatCurrency(profit)
      document.getElementById("profitMargin").textContent = `${margin}%`
      document.getElementById("profitPreview").style.display = "block"

      if (profit < 0) {
        document.getElementById("expectedProfit").classList.add("negative")
        document.getElementById("profitMargin").classList.add("negative")
      } else {
        document.getElementById("expectedProfit").classList.remove("negative")
        document.getElementById("profitMargin").classList.remove("negative")
      }
    } else {
      document.getElementById("profitPreview").style.display = "none"
    }
  }

  loadInventory(searchTerm = "", filterType = "all") {
    const tbody = document.querySelector("#inventoryTable tbody")
    tbody.innerHTML = ""

    let filteredProducts = this.products

    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType === "low-stock") {
      filteredProducts = filteredProducts.filter((p) => p.quantity <= this.settings.lowStockThreshold && p.quantity > 0)
    } else if (filterType === "out-of-stock") {
      filteredProducts = filteredProducts.filter((p) => p.quantity === 0)
    }

    filteredProducts.forEach((product) => {
      const row = tbody.insertRow()

      let statusClass = "status-in-stock"
      let statusText = "In Stock"

      if (product.quantity === 0) {
        statusClass = "status-out-of-stock"
        statusText = "Out of Stock"
      } else if (product.quantity <= this.settings.lowStockThreshold) {
        statusClass = "status-low-stock"
        statusText = "Low Stock"
      }

      row.innerHTML = `
        <td>${product.barcode}</td>
        <td>${product.name}</td>
        <td>${product.company}</td>
        <td>${product.quantity}</td>
        <td>${this.formatCurrency(product.purchasePrice)}</td>
        <td>${this.formatCurrency(product.sellingPrice)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="shopManager.editProduct('${product.barcode}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="shopManager.deleteProduct('${product.barcode}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `
    })

    if (filteredProducts.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="8" style="text-align: center;">No products found</td>'
    }
  }

  editProduct(barcode) {
    showToast("Edit functionality coming soon", "info")
  }

  deleteProduct(barcode) {
    if (confirm("Are you sure you want to delete this product?")) {
      this.products = this.products.filter((p) => p.barcode !== barcode)
      this.saveData()
      this.loadInventory()
      showToast("Product deleted successfully", "success")
    }
  }

  loadStatements() {
    this.loadDailySalesStatement()
    this.loadDailyProcurementStatement()
  }

  loadDailySalesStatement() {
    const today = new Date()
    document.getElementById("dailySalesDate").textContent = today.toLocaleDateString()

    const todaySales = this.sales.filter((sale) => new Date(sale.timestamp).toDateString() === today.toDateString())

    const tbody = document.querySelector("#dailySalesTable tbody")
    tbody.innerHTML = ""

    let totalSales = 0
    let totalProfit = 0

    todaySales.forEach((sale) => {
      sale.items.forEach((item) => {
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        totalSales += item.total
        totalProfit += profit

        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(profit)}</td>
          <td>${this.formatCurrency(item.total)}</td>
        `
      })
    })

    if (todaySales.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="7" style="text-align: center;">No sales data for today</td>'
    }

    document.getElementById("dailySalesTotal").textContent = this.formatCurrency(totalSales)
    document.getElementById("dailyProfitTotal").textContent = this.formatCurrency(totalProfit)
  }

  loadDailyProcurementStatement() {
    const today = new Date()
    document.getElementById("dailyProcurementDate").textContent = today.toLocaleDateString()

    const todayProcurements = this.procurements.filter(
      (proc) => new Date(proc.timestamp).toDateString() === today.toDateString(),
    )

    const tbody = document.querySelector("#dailyProcurementTable tbody")
    tbody.innerHTML = ""

    let totalPurchases = 0

    todayProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        totalPurchases += item.total

        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(item.total)}</td>
        `
      })
    })

    if (todayProcurements.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="6" style="text-align: center;">No procurement data for today</td>'
    }

    document.getElementById("dailyProcurementTotal").textContent = this.formatCurrency(totalPurchases)
  }

  generateSalesRangeReport() {
    const fromDate = new Date(document.getElementById("salesFromDate").value)
    const toDate = new Date(document.getElementById("salesToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select both dates", "error")
      return
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeSales = this.sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= fromDate && saleDate <= toDate
    })

    const tbody = document.querySelector("#rangeSalesTable tbody")
    tbody.innerHTML = ""

    let totalSales = 0
    let totalProfit = 0

    rangeSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        totalSales += item.total
        totalProfit += profit

        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
          <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(profit)}</td>
          <td>${this.formatCurrency(item.total)}</td>
        `
      })
    })

    if (rangeSales.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="8" style="text-align: center;">No sales data for selected range</td>'
    }

    document.getElementById("rangeSalesTotal").textContent = this.formatCurrency(totalSales)
    document.getElementById("rangeProfitTotal").textContent = this.formatCurrency(totalProfit)

    showToast("Sales range report generated", "success")
  }

  generateProcurementRangeReport() {
    const fromDate = new Date(document.getElementById("procurementFromDate").value)
    const toDate = new Date(document.getElementById("procurementToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select both dates", "error")
      return
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate >= fromDate && procDate <= toDate
    })

    const tbody = document.querySelector("#rangeProcurementTable tbody")
    tbody.innerHTML = ""

    let totalPurchases = 0

    rangeProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        totalPurchases += item.total

        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${new Date(proc.timestamp).toLocaleDateString()}</td>
          <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.purchasePrice)}</td>
          <td>${this.formatCurrency(item.sellingPrice)}</td>
          <td>${this.formatCurrency(item.total)}</td>
        `
      })
    })

    if (rangeProcurements.length === 0) {
      const row = tbody.insertRow()
      row.innerHTML = '<td colspan="7" style="text-align: center;">No procurement data for selected range</td>'
    }

    document.getElementById("rangeProcurementTotal").textContent = this.formatCurrency(totalPurchases)

    showToast("Procurement range report generated", "success")
  }

  printStatement(statementType) {
    let printContent = ""
    let title = ""

    switch (statementType) {
      case "daily-sales":
        title = `Daily Sales Statement - ${new Date().toLocaleDateString()}`
        printContent = this.prepareDailySalesPrintContent()
        break
      case "range-sales":
        const fromDate = document.getElementById("salesFromDate").value
        const toDate = document.getElementById("salesToDate").value
        title = `Sales Statement - ${fromDate} to ${toDate}`
        printContent = this.prepareRangeSalesPrintContent()
        break
      case "daily-procurement":
        title = `Daily Procurement Statement - ${new Date().toLocaleDateString()}`
        printContent = this.prepareDailyProcurementPrintContent()
        break
      case "range-procurement":
        const procFromDate = document.getElementById("procurementFromDate").value
        const procToDate = document.getElementById("procurementToDate").value
        title = `Procurement Statement - ${procFromDate} to ${procToDate}`
        printContent = this.prepareRangeProcurementPrintContent()
        break
      default:
        showToast("Unknown statement type", "error")
        return
    }

    const printWindow = window.open("", "_blank", "width=800,height=600")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000;
              background: #fff;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .header h1 { 
              margin: 0 0 10px 0; 
              font-size: 24px;
            }
            .header p { 
              margin: 5px 0; 
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold;
            }
            .totals { 
              margin-top: 20px; 
              font-weight: bold; 
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.settings.shopName}</h1>
            <p>${this.settings.shopAddress}</p>
            <p>Phone: ${this.settings.shopPhone}</p>
            <p><strong>${title}</strong></p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
          ${printContent}
          <div class="footer">
            <p>This is a computer-generated report from ${this.settings.shopName}</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
      }, 3000)
    }
  }

  prepareDailySalesPrintContent() {
    const today = new Date().toDateString()
    const dailySales = this.sales.filter((sale) => new Date(sale.timestamp).toDateString() === today)

    let totalSales = 0
    let totalProfit = 0

    const rows = dailySales
      .flatMap((sale) =>
        sale.items.map((item) => {
          const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
          totalSales += item.total
          totalProfit += profit

          return `
          <tr>
            <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(profit)}</td>
            <td>${this.formatCurrency(item.total)}</td>
          </tr>
        `
        }),
      )
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Profit</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align: center;">No sales data available</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Sales Amount:</span>
          <span>${this.formatCurrency(totalSales)}</span>
        </div>
        <div class="total-row">
          <span>Total Profit:</span>
          <span>${this.formatCurrency(totalProfit)}</span>
        </div>
      </div>
    `
  }

  prepareRangeSalesPrintContent() {
    const fromDate = new Date(document.getElementById("salesFromDate").value)
    const toDate = new Date(document.getElementById("salesToDate").value)

    if (!fromDate || !toDate) {
      return "<p>Please select a valid date range first.</p>"
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeSales = this.sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= fromDate && saleDate <= toDate
    })

    let totalSales = 0
    let totalProfit = 0

    const rows = rangeSales
      .flatMap((sale) =>
        sale.items.map((item) => {
          const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
          totalSales += item.total
          totalProfit += profit

          return `
          <tr>
            <td>${new Date(sale.timestamp).toLocaleDateString()}</td>
            <td>${new Date(sale.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(profit)}</td>
            <td>${this.formatCurrency(item.total)}</td>
          </tr>
        `
        }),
      )
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Profit</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="8" style="text-align: center;">No sales data available for selected range</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Sales Amount:</span>
          <span>${this.formatCurrency(totalSales)}</span>
        </div>
        <div class="total-row">
          <span>Total Profit:</span>
          <span>${this.formatCurrency(totalProfit)}</span>
        </div>
      </div>
    `
  }

  prepareDailyProcurementPrintContent() {
    const today = new Date().toDateString()
    const dailyProcurements = this.procurements.filter((proc) => new Date(proc.timestamp).toDateString() === today)

    let totalPurchases = 0

    const rows = dailyProcurements
      .flatMap((proc) =>
        proc.items.map((item) => {
          totalPurchases += item.total

          return `
          <tr>
            <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(item.total)}</td>
          </tr>
        `
        }),
      )
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6" style="text-align: center;">No procurement data available</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Purchase Amount:</span>
          <span>${this.formatCurrency(totalPurchases)}</span>
        </div>
      </div>
    `
  }

  prepareRangeProcurementPrintContent() {
    const fromDate = new Date(document.getElementById("procurementFromDate").value)
    const toDate = new Date(document.getElementById("procurementToDate").value)

    if (!fromDate || !toDate) {
      return "<p>Please select a valid date range first.</p>"
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate >= fromDate && procDate <= toDate
    })

    let totalPurchases = 0

    const rows = rangeProcurements
      .flatMap((proc) =>
        proc.items.map((item) => {
          totalPurchases += item.total

          return `
          <tr>
            <td>${new Date(proc.timestamp).toLocaleDateString()}</td>
            <td>${new Date(proc.timestamp).toLocaleTimeString()}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${this.formatCurrency(item.purchasePrice)}</td>
            <td>${this.formatCurrency(item.sellingPrice)}</td>
            <td>${this.formatCurrency(item.total)}</td>
          </tr>
        `
        }),
      )
      .join("")

    return `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align: center;">No procurement data available for selected range</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">
          <span>Total Purchase Amount:</span>
          <span>${this.formatCurrency(totalPurchases)}</span>
        </div>
      </div>
    `
  }

  exportToCSV(statementType) {
    let csvContent = ""
    let filename = ""

    switch (statementType) {
      case "daily-sales":
        csvContent = this.prepareDailySalesCSV()
        filename = `daily-sales-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "range-sales":
        csvContent = this.prepareRangeSalesCSV()
        filename = `sales-range-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "daily-procurement":
        csvContent = this.prepareDailyProcurementCSV()
        filename = `daily-procurement-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "range-procurement":
        csvContent = this.prepareRangeProcurementCSV()
        filename = `procurement-range-${new Date().toISOString().split("T")[0]}.csv`
        break
      default:
        showToast("Unknown statement type", "error")
        return
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast("CSV exported successfully!", "success")
  }

  prepareDailySalesCSV() {
    const today = new Date().toDateString()
    const dailySales = this.sales.filter((sale) => new Date(sale.timestamp).toDateString() === today)

    let csv = "Time,Product,Quantity,Purchase Price,Selling Price,Profit,Line Total\n"

    dailySales.forEach((sale) => {
      sale.items.forEach((item) => {
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        csv += `${new Date(sale.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${profit},${item.total}\n`
      })
    })

    return csv
  }

  prepareRangeSalesCSV() {
    const fromDate = new Date(document.getElementById("salesFromDate").value)
    const toDate = new Date(document.getElementById("salesToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select a valid date range first", "error")
      return ""
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeSales = this.sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= fromDate && saleDate <= toDate
    })

    let csv = "Date,Time,Product,Quantity,Purchase Price,Selling Price,Profit,Line Total\n"

    rangeSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const profit = (item.sellingPrice - item.purchasePrice) * item.quantity
        csv += `${new Date(sale.timestamp).toLocaleDateString()},${new Date(sale.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${profit},${item.total}\n`
      })
    })

    return csv
  }

  prepareDailyProcurementCSV() {
    const today = new Date().toDateString()
    const dailyProcurements = this.procurements.filter((proc) => new Date(proc.timestamp).toDateString() === today)

    let csv = "Time,Product,Quantity,Purchase Price,Selling Price,Line Total\n"

    dailyProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        csv += `${new Date(proc.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${item.total}\n`
      })
    })

    return csv
  }

  prepareRangeProcurementCSV() {
    const fromDate = new Date(document.getElementById("procurementFromDate").value)
    const toDate = new Date(document.getElementById("procurementToDate").value)

    if (!fromDate || !toDate) {
      showToast("Please select a valid date range first", "error")
      return ""
    }

    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const rangeProcurements = this.procurements.filter((proc) => {
      const procDate = new Date(proc.timestamp)
      return procDate >= fromDate && procDate <= toDate
    })

    let csv = "Date,Time,Product,Quantity,Purchase Price,Selling Price,Line Total\n"

    rangeProcurements.forEach((proc) => {
      proc.items.forEach((item) => {
        csv += `${new Date(proc.timestamp).toLocaleDateString()},${new Date(proc.timestamp).toLocaleTimeString()},${item.name},${item.quantity},${item.purchasePrice},${item.sellingPrice},${item.total}\n`
      })
    })

    return csv
  }

  saveSettings() {
    this.settings.shopName = document.getElementById("shopName").value
    this.settings.shopAddress = document.getElementById("shopAddress").value
    this.settings.shopPhone = document.getElementById("shopPhone").value
    this.settings.lowStockThreshold = Number.parseInt(document.getElementById("lowStockThreshold").value)
    this.settings.currency = document.getElementById("currency").value.trim()
    this.settings.darkMode = document.getElementById("darkModePreference").value

    this.saveData()
    this.applyTheme(this.settings.darkMode)
    this.updateCurrencySymbols()
    showToast("Settings saved successfully!", "success")
  }

  loadSettingsValues() {
    document.getElementById("shopName").value = this.settings.shopName
    document.getElementById("shopAddress").value = this.settings.shopAddress
    document.getElementById("shopPhone").value = this.settings.shopPhone
    document.getElementById("lowStockThreshold").value = this.settings.lowStockThreshold
    document.getElementById("currency").value = this.settings.currency
    document.getElementById("darkModePreference").value = this.settings.darkMode
  }

  showResetConfirmModal() {
    const modal = document.getElementById("resetConfirmModal")
    const confirmText = document.getElementById("confirmText")
    const confirmBtn = document.getElementById("confirmReset")
    const confirmError = document.getElementById("confirmError")

    confirmText.value = ""
    confirmBtn.disabled = true
    confirmError.style.display = "none"

    modal.style.display = "block"

    const handleInput = () => {
      const isValid = confirmText.value === "CONFIRM"
      confirmBtn.disabled = !isValid

      if (confirmText.value && !isValid) {
        confirmError.style.display = "block"
      } else {
        confirmError.style.display = "none"
      }
    }

    const handleConfirm = () => {
      if (confirmText.value === "CONFIRM") {
        this.resetAllData()
        modal.style.display = "none"
        confirmText.removeEventListener("input", handleInput)
        confirmBtn.removeEventListener("click", handleConfirm)
      }
    }

    const handleCancel = () => {
      modal.style.display = "none"
      confirmText.removeEventListener("input", handleInput)
      confirmBtn.removeEventListener("click", handleConfirm)
    }

    confirmText.addEventListener("input", handleInput)
    confirmBtn.addEventListener("click", handleConfirm)
    document.getElementById("cancelReset").addEventListener("click", handleCancel)
  }

  printReceiptContent() {
    const receiptContent = document.getElementById("receiptContent").innerHTML

    const printWindow = window.open("", "_blank", "width=400,height=600")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 10px; 
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.4;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .receipt-header h2 { 
              margin: 0 0 5px 0; 
              font-size: 16px;
              font-weight: bold;
            }
            .receipt-header p { 
              margin: 2px 0; 
              font-size: 11px;
            }
            .receipt-items table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 10px; 
            }
            .receipt-items th, .receipt-items td { 
              padding: 2px 4px; 
              font-size: 11px;
            }
            .receipt-items th { 
              border-bottom: 1px solid #000;
              font-weight: bold;
            }
            .receipt-total { 
              margin-top: 10px; 
            }
            .receipt-footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 11px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .receipt-header, .receipt-items, .receipt-total, .receipt-footer {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `)

    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  initReceiptListeners() {
    document.getElementById("printReceipt").addEventListener("click", () => {
      this.printReceiptContent()
    })

    document.getElementById("closeReceipt").addEventListener("click", () => {
      this.hideModal("receiptModal")
    })
  }
}

const shopManager = new ShopManager()

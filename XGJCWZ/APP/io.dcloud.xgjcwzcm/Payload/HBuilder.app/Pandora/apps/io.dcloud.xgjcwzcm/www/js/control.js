var control = {
	// 当前设备绑定的仓库
	WAREHOUSE_KEY: "warehouse-key",
	WAREHOUSE_LOCATION_KEY: "warehouse-location-key",
	DICT_CODE: {
		MATERIAL_TYPE: "10010000",
		DRIVER_CARD_TYPE: "10020000"
	},
	getWarehouse: function() {
		var that = this;
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: '/warehouse/list',
				success: function(data) {
					resolve(data);
				},
				error: function() {
					reject()
				}
			})
		});
	},

	getWarehouseCache: function() {
		if (localStorage[this.WAREHOUSE_KEY]) {
			return JSON.parse(localStorage[this.WAREHOUSE_KEY]);
		}
	},
	setWarehouse: function(warehouse) {
		if (warehouse) {
			localStorage[this.WAREHOUSE_KEY] = JSON.stringify(warehouse);
		} else {
			localStorage.removeItem(this.WAREHOUSE_KEY);
		}

	},

	// 获取 库位
	getWarehouseLocation: function(warehouse) {
		var that = this;
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: '/warehouseLocation/' + warehouse.code + '/list',
				success: function(data) {
					resolve(data);
				},
				error: function() {
					reject();
				}
			});
		});
	},

	getWarehouseLocationCache: function() {
		if (localStorage[this.WAREHOUSE_LOCATION_KEY]) {
			return JSON.parse(localStorage[this.WAREHOUSE_LOCATION_KEY]);
		}
	},
	// 设置库位
	setWarehouseLocation: function(warehouseLocation) {
		if (warehouseLocation) {
			localStorage[this.WAREHOUSE_LOCATION_KEY] = JSON.stringify(warehouseLocation);
		} else {
			localStorage.removeItem(this.WAREHOUSE_LOCATION_KEY);
		}
	},

	// 获取字典数据
	getDict: function(code) {
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: "/dict/" + code + "/list",
				success: function(data) {
					resolve(data)
				},
				error: function() {
					reject()
				}
			});
		});
	},
	getOrgList: function() {
		var that = this;
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: '/org/permission/tree',
				success: function(data) {
					that.handleOrgData(data)
					resolve(data)
				},
				error: function() {
					reject()
				}
			})
		});
	},
	handleOrgData: function(data, level) {
		var that = this;
		level = level || 0;
		$.each(data, function() {
			this.code = this.id;
			this.level = level;
			if (this.children && this.children.length) {
				that.handleOrgData(this.children, level + 1);
			}
		})
	},
	getOrderNo: function(code) {
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: "/serial/" + code,
				dataType: "text",
				success: function(data) {
					resolve(data);
				},
				error: function() {
					reject();
				}
			});
		});
	},
	getOldBarcode: function(code, warehouseCode) {
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: '/barcode/' + code + "/old",
				data: {
					warehouseCode: warehouseCode
				},
				success: function(data) {
					resolve(data);
				},
				error: function() {
					reject();
				}
			})
		});
	},
	getBarcode: function(code, warehouseCode,warehouseStatus) {
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: '/barcode/' + code,
				data: {
					warehouseCode: warehouseCode,
					warehouseStatus: 1
				},
				success: function(data) {
					resolve(data);
				},
				error: function() {
					reject();
				}
			})
		});
	},
	getBarcodeIn: function(code, warehouseCode) {
		return new Promise(function(resolve, reject) {
			util.ajax({
				url: '/barcode/' + code,
				data: {
					warehouseCode: warehouseCode
				},
				success: function(data) {
					resolve(data);
				},
				error: function() {
					reject();
				}
			})
		});
	}

};

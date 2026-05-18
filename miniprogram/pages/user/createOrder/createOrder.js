const {
  APPLIANCE_TYPES,
  callCloud,
  formatFullAddress,
  isValidPhone,
} = require('../../../utils/util');

Page({
  data: {
    applianceTypes: APPLIANCE_TYPES,
    typeIndex: -1,
    brand: '',
    model: '',
    faultDesc: '',
    userName: '',
    userPhone: '',
    userAddress: '',
    preferredTime: '',
    preferredDate: '',
    currentYear: '',
    availableDates: [],
    datePickerMonths: [],
    datePickerMonthKeys: [],
    datePickerDays: [],
    datePickerDayValues: [],
    datePickerValue: [0, 0],
    selectedTimeSlot: '',
    timeSlotOptions: [],
    timeSlotIndex: -1,
    dateStart: '',
    dateEnd: '',
    noAvailablePreferredTime: false,
    images: [],
    submitting: false,
    selectedAddress: null,
  },

  onLoad() {
    this.initPreferredTimeOptions();
    this.prefillContactInfo();
  },

  onTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  initPreferredTimeOptions() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const dateEnd = `${currentYear}-12-31`;
    const availableDates = this.getAvailableDatesInCurrentYear(today, dateEnd);
    const firstAvailableDate = availableDates.length ? availableDates[0].value : '';

    if (!firstAvailableDate) {
      this.setData({
        currentYear,
        availableDates: [],
        datePickerMonths: [],
        datePickerMonthKeys: [],
        datePickerDays: [],
        datePickerDayValues: [],
        datePickerValue: [0, 0],
        preferredDate: '',
        selectedTimeSlot: '',
        timeSlotOptions: [],
        timeSlotIndex: -1,
        preferredTime: '',
        dateStart: this.formatDate(today),
        dateEnd,
        noAvailablePreferredTime: true,
      });
      return;
    }

    const timeSlotOptions = this.getAvailableTimeSlots(firstAvailableDate);
    const pickerState = this.buildDatePickerState(availableDates, firstAvailableDate);
    this.setData({
      currentYear,
      availableDates,
      datePickerMonths: pickerState.datePickerMonths,
      datePickerMonthKeys: pickerState.datePickerMonthKeys,
      datePickerDays: pickerState.datePickerDays,
      datePickerDayValues: pickerState.datePickerDayValues,
      datePickerValue: pickerState.datePickerValue,
      preferredDate: firstAvailableDate,
      selectedTimeSlot: '',
      timeSlotOptions,
      timeSlotIndex: -1,
      preferredTime: '',
      dateStart: firstAvailableDate,
      dateEnd,
      noAvailablePreferredTime: false,
    });
  },

  getAvailableDatesInCurrentYear(startDate, endDateStr) {
    const cursor = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const endDate = this.parseDateString(endDateStr);
    const availableDates = [];

    while (cursor.getTime() <= endDate.getTime()) {
      const dateStr = this.formatDate(cursor);
      if (this.getAvailableTimeSlots(dateStr).length > 0) {
        availableDates.push({
          value: dateStr,
          monthKey: String(cursor.getMonth() + 1).padStart(2, '0'),
          dayKey: String(cursor.getDate()).padStart(2, '0'),
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return availableDates;
  },

  buildDatePickerState(availableDates, selectedDate) {
    const targetDate = availableDates.find((item) => item.value === selectedDate) || availableDates[0];
    if (!targetDate) {
      return {
        datePickerMonths: [],
        datePickerMonthKeys: [],
        datePickerDays: [],
        datePickerDayValues: [],
        datePickerValue: [0, 0],
      };
    }

    const datePickerMonthKeys = availableDates
      .map((item) => item.monthKey)
      .filter((monthKey, index, list) => list.indexOf(monthKey) === index);

    const datePickerMonths = datePickerMonthKeys.map((monthKey) => `${Number(monthKey)}月`);
    const monthIndex = Math.max(datePickerMonthKeys.indexOf(targetDate.monthKey), 0);
    const monthDates = availableDates.filter((item) => item.monthKey === targetDate.monthKey);
    const datePickerDays = monthDates.map((item) => `${Number(item.dayKey)}日`);
    const datePickerDayValues = monthDates.map((item) => item.value);
    const dayIndex = Math.max(datePickerDayValues.indexOf(targetDate.value), 0);

    return {
      datePickerMonths,
      datePickerMonthKeys,
      datePickerDays,
      datePickerDayValues,
      datePickerValue: [monthIndex, dayIndex],
    };
  },

  getBaseTimeSlots() {
    return [
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
      '18:00-19:00',
      '19:00-20:00',
      '20:00-21:00',
    ];
  },

  getAvailableTimeSlots(dateStr) {
    if (!dateStr) return [];

    const selectedDate = this.parseDateString(dateStr);
    const now = new Date();
    const isToday = this.isSameDate(selectedDate, now);

    return this.getBaseTimeSlots().filter((slot) => {
      if (!isToday) return true;
      const startHour = Number(slot.slice(0, 2));
      const slotStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startHour,
        0,
        0,
        0
      );
      return slotStart.getTime() > now.getTime();
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  parseDateString(dateStr) {
    const parts = dateStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  },

  isSameDate(dateA, dateB) {
    return dateA.getFullYear() === dateB.getFullYear()
      && dateA.getMonth() === dateB.getMonth()
      && dateA.getDate() === dateB.getDate();
  },

  onDateChange(e) {
    const selectedIndexes = e.detail.value || [0, 0];
    const monthIndex = selectedIndexes[0] || 0;
    const dayIndex = selectedIndexes[1] || 0;
    const preferredDate = this.data.datePickerDayValues[dayIndex] || '';
    if (!preferredDate) return;

    const pickerState = this.buildDatePickerState(this.data.availableDates, preferredDate);
    const timeSlotOptions = this.getAvailableTimeSlots(preferredDate);
    const selectedTimeSlot = timeSlotOptions.includes(this.data.selectedTimeSlot)
      ? this.data.selectedTimeSlot
      : '';
    const timeSlotIndex = selectedTimeSlot ? timeSlotOptions.indexOf(selectedTimeSlot) : -1;

    this.setData({
      datePickerMonths: pickerState.datePickerMonths,
      datePickerMonthKeys: pickerState.datePickerMonthKeys,
      datePickerDays: pickerState.datePickerDays,
      datePickerDayValues: pickerState.datePickerDayValues,
      datePickerValue: [monthIndex, dayIndex],
      preferredDate,
      timeSlotOptions,
      selectedTimeSlot,
      timeSlotIndex,
      preferredTime: selectedTimeSlot ? `${preferredDate} ${selectedTimeSlot}` : '',
    });

    if (!timeSlotOptions.length) {
      wx.showToast({
        title: '该日期已无可选时段，请改选其他日期',
        icon: 'none',
      });
    }
  },

  onDateColumnChange(e) {
    const { column, value } = e.detail;
    const datePickerValue = this.data.datePickerValue.slice();
    datePickerValue[column] = value;

    if (column === 0) {
      const monthKey = this.data.datePickerMonthKeys[value];
      const monthDates = this.data.availableDates.filter((item) => item.monthKey === monthKey);
      this.setData({
        datePickerDays: monthDates.map((item) => `${Number(item.dayKey)}日`),
        datePickerDayValues: monthDates.map((item) => item.value),
        datePickerValue: [value, 0],
      });
      return;
    }

    this.setData({ datePickerValue });
  },

  onTimeChange(e) {
    const timeSlotIndex = Number(e.detail.value);
    const selectedTimeSlot = this.data.timeSlotOptions[timeSlotIndex] || '';
    this.setData({
      timeSlotIndex,
      selectedTimeSlot,
      preferredTime: selectedTimeSlot ? `${this.data.preferredDate} ${selectedTimeSlot}` : '',
    });
  },

  async prefillContactInfo() {
    const loginRes = await callCloud('user/login', {});
    if (loginRes && loginRes.code === 0) {
      const user = loginRes.data || {};
      const updateData = {};

      if (!this.data.userName && user.nickName) updateData.userName = user.nickName;
      if (!this.data.userPhone && user.phone) updateData.userPhone = user.phone;

      if (Object.keys(updateData).length) {
        this.setData(updateData);
      }
    }

    const addressRes = await callCloud('user/getAddresses', {});
    if (addressRes && addressRes.code === 0) {
      const defaultAddress = (addressRes.data || []).find((item) => item.isDefault) || null;
      if (defaultAddress) {
        this.applySelectedAddress(defaultAddress, false);
      }
    }
  },

  applySelectedAddress(address, overwrite = true) {
    const nextData = {
      selectedAddress: address,
    };

    if (overwrite || !this.data.userName) {
      nextData.userName = address.name || this.data.userName;
    }
    if (overwrite || !this.data.userPhone) {
      nextData.userPhone = address.phone || this.data.userPhone;
    }
    if (overwrite || !this.data.userAddress) {
      nextData.userAddress = formatFullAddress(address);
    }

    this.setData(nextData);
  },

  goSelectAddress() {
    wx.navigateTo({
      url: '/pages/user/addressList/addressList?mode=select',
      success: (res) => {
        res.eventChannel.on('addressSelected', (address) => {
          this.applySelectedAddress(address, true);
        });
      },
    });
  },

  chooseImage() {
    const remaining = 3 - this.data.images.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: [...this.data.images, ...newImages] });
      },
    });
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== idx);
    this.setData({ images });
  },

  async onSubmit() {
    const {
      typeIndex,
      applianceTypes,
      brand,
      faultDesc,
      userName,
      userPhone,
      userAddress,
      preferredDate,
      selectedTimeSlot,
      images,
      noAvailablePreferredTime,
    } = this.data;

    if (typeIndex < 0) { wx.showToast({ title: '请选择电器类型', icon: 'none' }); return; }
    if (!userName.trim()) { wx.showToast({ title: '请填写姓名', icon: 'none' }); return; }
    if (!isValidPhone(userPhone)) { wx.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
    if (!userAddress.trim()) { wx.showToast({ title: '请填写地址', icon: 'none' }); return; }
    if (!faultDesc.trim()) { wx.showToast({ title: '请描述故障', icon: 'none' }); return; }
    if (noAvailablePreferredTime) { wx.showToast({ title: '当前年度已无可预约时段', icon: 'none' }); return; }
    if (!preferredDate) { wx.showToast({ title: '请选择预约日期', icon: 'none' }); return; }
    if (!selectedTimeSlot) { wx.showToast({ title: '请选择预约时间段', icon: 'none' }); return; }

    const latestTimeSlotOptions = this.getAvailableTimeSlots(preferredDate);
    if (!latestTimeSlotOptions.includes(selectedTimeSlot)) {
      wx.showToast({ title: '所选时段已过期，请重新选择', icon: 'none' });
      this.setData({
        timeSlotOptions: latestTimeSlotOptions,
        selectedTimeSlot: '',
        timeSlotIndex: -1,
        preferredTime: '',
      });
      return;
    }

    const preferredTime = `${preferredDate} ${selectedTimeSlot}`;

    this.setData({ submitting: true });

    try {
      const imageFileIDs = [];
      for (const img of images) {
        const ext = img.split('.').pop();
        const cloudPath = `fault-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: img });
        imageFileIDs.push(uploadRes.fileID);
      }

      const result = await callCloud('user/createOrder', {
        applianceType: applianceTypes[typeIndex],
        applianceBrand: brand,
        faultDescription: faultDesc,
        userName,
        userPhone,
        userAddress,
        preferredTime,
        faultImages: imageFileIDs,
      });

      if (result) {
        wx.showToast({ title: '下单成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      console.error('提交订单失败:', err);
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});

     // Local Storage Keys
     const KEYS = {
        USERS: 'bc_users',
        MEMBERS: 'bc_members',
        TRANSACTIONS: 'bc_transactions',
        CURRENT_USER: 'bc_current_user'
    };

    // Add this right after your existing KEYS constant
const NOTIFICATIONS_KEY = 'bc_notifications';
const SCHEDULES_KEY = 'bc_schedules';

// Schedule templates
const SCHEDULE_TEMPLATES = [
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'Equal payments every month',
    intervalType: 'month',
    intervalValue: 1
  },
  {
    id: 'biweekly',
    name: 'Bi-weekly',
    description: 'Equal payments every two weeks',
    intervalType: 'week',
    intervalValue: 2
  },
  {
    id: 'weekly',
    name: 'Weekly',
    description: 'Equal payments every week',
    intervalType: 'week',
    intervalValue: 1
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    description: 'Equal payments every three months',
    intervalType: 'month',
    intervalValue: 3
  },
  {
    id: 'custom',
    name: 'Custom Schedule',
    description: 'Define your own payment dates',
    intervalType: 'custom',
    intervalValue: 0
  }
];

// Notification types and their configurations
const NOTIFICATION_TYPES = {
  payment_due: {
    icon: '⚠️',
    title: 'Payment Due',
    className: 'notification-payment_due'
  },
  payment_overdue: {
    icon: '🚨',
    title: 'Payment Overdue',
    className: 'notification-payment_overdue'
  },
  payment_received: {
    icon: '✅',
    title: 'Payment Received',
    className: 'notification-payment_received'
  },
  system: {
    icon: 'ℹ️',
    title: 'System Notification',
    className: 'notification-system'
  }
};
    // Initialize Data
    function initializeData() {
        // Check if admin user exists, if not create one
        let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
        if (!users.length) {
            users.push({
                id: 'admin1',
                username: 'admin',
                password: hashPassword('admin123'), // In real system, use a secure hashing algorithm
                role: 'admin',
                name: 'System Administrator'
            });
            localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        }

        // Initialize members if not exists
        if (!localStorage.getItem(KEYS.MEMBERS)) {
            localStorage.setItem(KEYS.MEMBERS, JSON.stringify([]));
        }

        // Initialize transactions if not exists
        if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
            localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
        }
    }

    // Add after initializeData() function

// Initialize notifications in localStorage if not exists
function initializeNotifications() {
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    }
  }
  
  // Add a new notification
  function addNotification(type, message, memberId = null) {
    if (!Object.keys(NOTIFICATION_TYPES).includes(type)) {
      console.error(`Invalid notification type: ${type}`);
      return;
    }
  
    const notifications = getNotifications();
    
    const newNotification = {
      id: `notif_${Date.now()}`,
      type,
      message,
      memberId,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.unshift(newNotification); // Add to beginning of array
    
    // Limit to 50 notifications to prevent localStorage overflow
    if (notifications.length > 50) {
      notifications.pop();
    }
    
    saveNotifications(notifications);
    updateNotificationBadge();
    
    return newNotification;
  }
  
  // Get all notifications
  function getNotifications() {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  }
  
  // Get notifications for a specific member
  function getMemberNotifications(memberId) {
    const notifications = getNotifications();
    return notifications.filter(n => n.memberId === memberId || n.memberId === null);
  }
  
  // Get unread notification count
  function getUnreadCount() {
    const notifications = getNotifications();
    return notifications.filter(n => !n.read).length;
  }
  
  // Mark a notification as read
  function markAsRead(notificationId) {
    const notifications = getNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications[index].read = true;
      saveNotifications(notifications);
      updateNotificationBadge();
    }
  }
  
  // Mark all notifications as read
// Fix for markAllAsRead function
function markAllAsRead() {
    const notifications = getNotifications();
    
    // Make sure we're actually modifying notifications
    if (notifications && notifications.length > 0) {
      notifications.forEach(n => n.read = true);
      saveNotifications(notifications);
      updateNotificationBadge();
      
      // Force re-render notifications
      renderNotifications();
      
      // Add debug log
      console.log('Marked all notifications as read:', notifications);
    }
  }
  
  // Make sure the event listener is properly attached
  function setupNotificationListeners() {
    const bellBtn = document.getElementById('notification-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    
    if (bellBtn) {
      bellBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        
        if (!dropdown.classList.contains('hidden')) {
          renderNotifications();
        }
      });
    }
    
    // Fix for mark all read button
    if (markAllReadBtn) {
      // Remove any existing event listeners
      markAllReadBtn.removeEventListener('click', markAllAsRead);
      
      // Add new event listener
      markAllReadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        markAllAsRead();
        console.log('Mark all read button clicked');
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (dropdown && !dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.add('hidden');
      }
    });
  }
  
  // Delete a notification
  function deleteNotification(notificationId) {
    const notifications = getNotifications();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
    updateNotificationBadge();
  }
  
  // Save notifications to localStorage
  function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
  
  // Update notification badge count
  function updateNotificationBadge() {
    const unreadCount = getUnreadCount();
    const badge = document.getElementById('notification-count');
    
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }
  
  // Render notifications in the dropdown
  function renderNotifications() {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notifications = getNotifications();
    container.innerHTML = '';
    
    if (notifications.length === 0) {
      container.innerHTML = '<div class="no-notifications">No notifications</div>';
      return;
    }
    
    notifications.forEach(notification => {
      const notifType = NOTIFICATION_TYPES[notification.type];
      const timeAgo = formatTimeAgo(new Date(notification.timestamp));
      
      const notifElement = document.createElement('div');
      notifElement.className = `notification ${notifType.className} ${notification.read ? 'read' : ''}`;
      
      notifElement.innerHTML = `
        <div class="notification-content">
          <div class="notification-message">
            ${notifType.icon} ${notification.message}
          </div>
          <div class="notification-time">${timeAgo}</div>
        </div>
        <button class="notification-dismiss" data-id="${notification.id}">&times;</button>
      `;
      
      container.appendChild(notifElement);
    });
    
    // Add event listeners to dismiss buttons
    document.querySelectorAll('.notification-dismiss').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const notificationId = this.getAttribute('data-id');
        deleteNotification(notificationId);
        renderNotifications();
      });
    });
    
    // Mark notifications as read when viewed
    document.querySelectorAll('.notification:not(.read)').forEach(notif => {
      const notificationId = notif.querySelector('.notification-dismiss').getAttribute('data-id');
      markAsRead(notificationId);
    });
  }
  
  // Format time ago (e.g., "2 hours ago")
  function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  // Generate system notifications based on data
  function generateSystemNotifications() {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    
    // Clear existing system notifications
    const notifications = getNotifications();
    const filteredNotifications = notifications.filter(n => 
      n.type !== 'payment_due' && n.type !== 'payment_overdue'
    );
    saveNotifications(filteredNotifications);
    
    // Check for overdue payments
    const today = new Date();
    
    members.forEach(member => {
      if (member.amountDue > 0) {
        // Get last payment date
        const memberTransactions = transactions
          .filter(t => t.memberId === member.id && t.status === 'paid')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const lastPayment = memberTransactions[0];
        
        if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.date);
          const daysSinceLastPayment = Math.floor((today - lastPaymentDate) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastPayment > 30) {
            // Overdue payment
            addNotification(
              'payment_overdue',
              `${member.name} has an overdue payment of PKR ${member.amountDue.toLocaleString()}`,
              member.id
            );
          } else if (daysSinceLastPayment > 20) {
            // Payment due soon
            addNotification(
              'payment_due',
              `${member.name}'s payment of PKR ${member.amountDue.toLocaleString()} is due soon`,
              member.id
            );
          }
        } else {
          // No payments yet
          addNotification(
            'payment_due',
            `${member.name} has not made any payments yet`,
            member.id
          );
        }
      }
    });
    
    updateNotificationBadge();
  }
  
  // Setup notification event listeners
  function setupNotificationListeners() {
    const bellBtn = document.getElementById('notification-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    
    if (bellBtn) {
      bellBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        
        if (!dropdown.classList.contains('hidden')) {
          renderNotifications();
        }
      });
    }
    
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', function() {
        markAllAsRead();
        renderNotifications();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (dropdown && !dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // Add after notification system functions

// Initialize schedules in localStorage if not exists
function initializeSchedules() {
    if (!localStorage.getItem(SCHEDULES_KEY)) {
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify([]));
    }
  }
  
  // Get all schedules
  function getAllSchedules() {
    return JSON.parse(localStorage.getItem(SCHEDULES_KEY) || '[]');
  }
  
  // Get schedules for a specific member
  function getMemberSchedules(memberId) {
    const schedules = getAllSchedules();
    return schedules.filter(s => s.memberId === memberId);
  }
  
  // Create a new payment schedule
  function createSchedule(memberId, templateId, startDate, totalAmount, customDates = []) {
    const template = SCHEDULE_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      console.error(`Invalid template ID: ${templateId}`);
      return null;
    }
    
    const scheduleId = `schedule_${Date.now()}`;
    const start = new Date(startDate);
    
    let paymentDates = [];
    
    if (template.id === 'custom' && customDates.length > 0) {
      // Use custom dates
      paymentDates = customDates.map(dateStr => {
        return {
          date: new Date(dateStr).toISOString(),
          amount: Math.round(totalAmount / customDates.length),
          status: 'pending'
        };
      });
    } else {
      // Generate dates based on template
      const numberOfPayments = calculateNumberOfPayments(template, totalAmount);
      const amountPerPayment = Math.round(totalAmount / numberOfPayments);
      
      for (let i = 0; i < numberOfPayments; i++) {
        const paymentDate = new Date(start);
        
        if (template.intervalType === 'month') {
          paymentDate.setMonth(paymentDate.getMonth() + (i * template.intervalValue));
        } else if (template.intervalType === 'week') {
          paymentDate.setDate(paymentDate.getDate() + (i * template.intervalValue * 7));
        }
        
        paymentDates.push({
          date: paymentDate.toISOString(),
          amount: amountPerPayment,
          status: 'pending'
        });
      }
    }
    
    const newSchedule = {
      id: scheduleId,
      memberId,
      templateId,
      startDate: start.toISOString(),
      totalAmount,
      createdAt: new Date().toISOString(),
      payments: paymentDates
    };
    
    // Save to localStorage
    const schedules = getAllSchedules();
    schedules.push(newSchedule);
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
    
    // Create notification
    addNotification(
      'system',
      `Payment schedule created for ${getMemberName(memberId)} with ${paymentDates.length} payments`,
      null
    );
    
    return newSchedule;
  }
  
  // Get member name by ID
  function getMemberName(memberId) {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Unknown Member';
  }
  
  // Calculate number of payments based on template and amount
  function calculateNumberOfPayments(template, totalAmount) {
    // Default to 12 payments for most templates
    if (template.id === 'monthly') return 12;
    if (template.id === 'biweekly') return 26;
    if (template.id === 'weekly') return 52;
    if (template.id === 'quarterly') return 4;
    
    // For custom templates, calculate based on amount
    // Aim for payments between 1,000 and 10,000 PKR
    const avgPayment = 5000;
    return Math.max(1, Math.round(totalAmount / avgPayment));
  }
  
  // Update payment status
  function updatePaymentStatus(scheduleId, paymentIndex, newStatus) {
    const schedules = getAllSchedules();
    const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex === -1) {
      console.error(`Schedule not found: ${scheduleId}`);
      return false;
    }
    
    if (paymentIndex < 0 || paymentIndex >= schedules[scheduleIndex].payments.length) {
      console.error(`Invalid payment index: ${paymentIndex}`);
      return false;
    }
    
    schedules[scheduleIndex].payments[paymentIndex].status = newStatus;
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
    
    // If payment is marked as paid, create a transaction
    if (newStatus === 'paid') {
      const schedule = schedules[scheduleIndex];
      const payment = schedule.payments[paymentIndex];
      
      // Create transaction
      const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
      const newTransaction = {
        id: `trans_${Date.now()}`,
        memberId: schedule.memberId,
        amount: payment.amount,
        status: 'paid',
        notes: `Scheduled payment #${paymentIndex + 1}`,
        date: new Date().toISOString()
      };
      
      transactions.push(newTransaction);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      
      // Update member's amount due
      const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
      const memberIndex = members.findIndex(m => m.id === schedule.memberId);
      
      if (memberIndex !== -1) {
        members[memberIndex].amountDue = Math.max(0, members[memberIndex].amountDue - payment.amount);
        localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
      }
      
      // Create notification
      const member = members[memberIndex];
      addNotification(
        'payment_received',
        `Payment of PKR ${payment.amount.toLocaleString()} received from ${member ? member.name : 'member'}`,
        schedule.memberId
      );
    }
    
    return true;
  }
  
  // Delete a schedule
  function deleteSchedule(scheduleId) {
    const schedules = getAllSchedules();
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updatedSchedules));
  }
  
  // Get upcoming payments for all members
  function getUpcomingPayments(limit = 10) {
    const schedules = getAllSchedules();
    const allPayments = [];
    
    schedules.forEach(schedule => {
      schedule.payments.forEach((payment, index) => {
        if (payment.status === 'pending') {
          allPayments.push({
            scheduleId: schedule.id,
            memberId: schedule.memberId,
            paymentIndex: index,
            date: new Date(payment.date),
            amount: payment.amount,
            status: payment.status
          });
        }
      });
    });
    
    // Sort by date (earliest first)
    allPayments.sort((a, b) => a.date - b.date);
    
    return allPayments.slice(0, limit);
  }
  
  // Check for due payments and generate notifications
  function checkDuePayments() {
    const today = new Date();
    const schedules = getAllSchedules();
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    
    schedules.forEach(schedule => {
      schedule.payments.forEach((payment, index) => {
        if (payment.status === 'pending') {
          const paymentDate = new Date(payment.date);
          const daysDifference = Math.floor((paymentDate - today) / (1000 * 60 * 60 * 24));
          
          // If payment is due within 3 days or overdue
          if (daysDifference <= 3 && daysDifference >= -7) {
            const member = members.find(m => m.id === schedule.memberId);
            
            if (member) {
              const notificationType = daysDifference < 0 ? 'payment_overdue' : 'payment_due';
              const message = daysDifference < 0
                ? `${member.name}'s payment of PKR ${payment.amount.toLocaleString()} is overdue by ${Math.abs(daysDifference)} days`
                : `${member.name}'s payment of PKR ${payment.amount.toLocaleString()} is due in ${daysDifference} days`;
              
              addNotification(
                notificationType,
                message,
                member.id
              );
            }
          }
        }
      });
    });
  }


  // Add after payment schedule functions

// Populate schedule template dropdown
function populateScheduleTemplates() {
    const templateSelect = document.getElementById('schedule-template');
    if (!templateSelect) return;
    
    templateSelect.innerHTML = '';
    
    SCHEDULE_TEMPLATES.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.name;
      templateSelect.appendChild(option);
    });
  }
  
  // Show template details
  function showTemplateDetails(templateId) {
    const container = document.getElementById('template-details-container');
    if (!container) return;
    
    const template = SCHEDULE_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      container.classList.add('hidden');
      return;
    }
    
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="template-info">
        <p><strong>${template.name}</strong>: ${template.description}</p>
      </div>
    `;
    
    // Show/hide custom dates container
    const customDatesContainer = document.getElementById('custom-dates-container');
    const addCustomDateBtn = document.getElementById('add-custom-date-btn');
    
    if (customDatesContainer && addCustomDateBtn) {
      if (templateId === 'custom') {
        customDatesContainer.classList.remove('hidden');
        addCustomDateBtn.classList.remove('hidden');
      } else {
        customDatesContainer.classList.add('hidden');
        addCustomDateBtn.classList.add('hidden');
      }
    }
  }
  
  // Add custom date field
  function addCustomDateField() {
    const container = document.getElementById('custom-dates-container');
    if (!container) return;
    
    const dateIndex = container.querySelectorAll('.custom-date-group').length;
    
    const dateGroup = document.createElement('div');
    dateGroup.className = 'custom-date-group';
    
    dateGroup.innerHTML = `
      <div class="date-field-row">
        <div class="form-group" style="flex: 2;">
          <label for="custom-date-${dateIndex}">Payment Date ${dateIndex + 1}</label>
          <input type="date" class="form-control custom-date" id="custom-date-${dateIndex}" required>
        </div>
        <div class="form-group" style="flex: 1; display: flex; align-items: flex-end;">
          <button type="button" class="btn btn-danger remove-date-btn" data-index="${dateIndex}" style="height: 42px;">Remove</button>
        </div>
      </div>
    `;
    
    container.appendChild(dateGroup);
    
    // Add event listener to remove button
    dateGroup.querySelector('.remove-date-btn').addEventListener('click', function() {
      container.removeChild(dateGroup);
    });
  }
  
  // Get custom dates from form
  function getCustomDatesFromForm() {
    const dateInputs = document.querySelectorAll('.custom-date');
    const dates = [];
    
    dateInputs.forEach(input => {
      if (input.value) {
        dates.push(input.value);
      }
    });
    
    return dates;
  }
  
  // Load admin schedules
  function loadAdminSchedules() {
    const schedules = getAllSchedules();
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    
    const tbody = document.getElementById('admin-schedules-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (schedules.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" class="text-center">No schedules found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    // Get all upcoming payments
    const upcomingPayments = [];
    
    schedules.forEach(schedule => {
      const member = members.find(m => m.id === schedule.memberId);
      
      schedule.payments.forEach((payment, index) => {
        if (payment.status === 'pending') {
          upcomingPayments.push({
            scheduleId: schedule.id,
            memberId: schedule.memberId,
            memberName: member ? member.name : 'Unknown',
            paymentIndex: index,
            date: new Date(payment.date),
            amount: payment.amount,
            status: payment.status
          });
        }
      });
    });
    
    // Sort by date (earliest first)
    upcomingPayments.sort((a, b) => a.date - b.date);
    
    // Display upcoming payments (limit to 20)
    const paymentsToShow = upcomingPayments.slice(0, 20);
    
    paymentsToShow.forEach(payment => {
      const tr = document.createElement('tr');
      
      const today = new Date();
      const daysDifference = Math.floor((payment.date - today) / (1000 * 60 * 60 * 24));
      
      let statusClass = 'badge-warning';
      let statusText = 'Upcoming';
      
      if (daysDifference < 0) {
        statusClass = 'badge-danger';
        statusText = 'Overdue';
      } else if (daysDifference <= 3) {
        statusClass = 'badge-warning';
        statusText = 'Due Soon';
      }
      
      tr.innerHTML = `
        <td>${payment.memberName}</td>
        <td>${payment.date.toLocaleDateString()}</td>
        <td>PKR ${payment.amount.toLocaleString()}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn btn-success mark-paid-btn" 
            data-schedule="${payment.scheduleId}" 
            data-index="${payment.paymentIndex}">
            Mark as Paid
          </button>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Add event listeners to mark paid buttons
    document.querySelectorAll('.mark-paid-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const scheduleId = this.getAttribute('data-schedule');
        const paymentIndex = parseInt(this.getAttribute('data-index'));
        
        updatePaymentStatus(scheduleId, paymentIndex, 'paid');
        loadAdminSchedules();
        
        // Reload other data that might be affected
        loadTransactions();
        loadRecentTransactions();
        loadMembers();
        loadDashboardStats();
        loadReports();
      });
    });
  }
  
  // Load member payment schedule
  function loadMemberPaymentSchedule(memberId) {
    const memberSchedules = getMemberSchedules(memberId);
    
    const tbody = document.getElementById('payment-schedule-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (memberSchedules.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="3" class="text-center">No payment schedule found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    // Get all payments from all schedules
    const allPayments = [];
    
    memberSchedules.forEach(schedule => {
      schedule.payments.forEach(payment => {
        allPayments.push({
          date: new Date(payment.date),
          amount: payment.amount,
          status: payment.status
        });
      });
    });
    
    // Sort by date (earliest first)
    allPayments.sort((a, b) => a.date - b.date);
    
    allPayments.forEach(payment => {
      const tr = document.createElement('tr');
      
      const today = new Date();
      const daysDifference = Math.floor((payment.date - today) / (1000 * 60 * 60 * 24));
      
      let statusClass = 'badge-warning';
      let statusText = payment.status === 'paid' ? 'Paid' : 'Upcoming';
      
      if (payment.status === 'paid') {
        statusClass = 'badge-success';
      } else if (daysDifference < 0) {
        statusClass = 'badge-danger';
        statusText = 'Overdue';
      } else if (daysDifference <= 3) {
        statusClass = 'badge-warning';
        statusText = 'Due Soon';
      }
      
      tr.innerHTML = `
        <td>${payment.date.toLocaleDateString()}</td>
        <td>PKR ${payment.amount.toLocaleString()}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
      `;
      
      tbody.appendChild(tr);
    });
  }
  
  // Setup schedule form event listeners
  function setupScheduleFormListeners() {
    // Template change event
    const templateSelect = document.getElementById('schedule-template');
    if (templateSelect) {
      templateSelect.addEventListener('change', function() {
        showTemplateDetails(this.value);
      });
    }
    
    // Add custom date button
    const addCustomDateBtn = document.getElementById('add-custom-date-btn');
    if (addCustomDateBtn) {
      addCustomDateBtn.addEventListener('click', addCustomDateField);
    }
    
    // Create schedule form submit
    const createScheduleForm = document.getElementById('create-schedule-form');
    if (createScheduleForm) {
      createScheduleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const memberId = document.getElementById('schedule-member').value;
        const templateId = document.getElementById('schedule-template').value;
        const startDate = document.getElementById('schedule-start-date').value;
        const totalAmount = parseFloat(document.getElementById('schedule-total-amount').value);
        
        let customDates = [];
        if (templateId === 'custom') {
          customDates = getCustomDatesFromForm();
          if (customDates.length === 0) {
            alert('Please add at least one payment date for custom schedule');
            return;
          }
        }
        
        createSchedule(memberId, templateId, startDate, totalAmount, customDates);
        
        // Close modal
        document.getElementById('create-schedule-modal').style.display = 'none';
        
        // Reload schedules
        loadAdminSchedules();
        
        // Reset form
        createScheduleForm.reset();
        document.getElementById('custom-dates-container').innerHTML = '';
        document.getElementById('template-details-container').classList.add('hidden');
      });
    }
    
    // Modal close buttons
    document.getElementById('close-create-schedule')?.addEventListener('click', function() {
      document.getElementById('create-schedule-modal').style.display = 'none';
    });
    
    document.getElementById('cancel-create-schedule')?.addEventListener('click', function() {
      document.getElementById('create-schedule-modal').style.display = 'none';
    });
    
    // Create schedule button
    document.getElementById('create-schedule-btn')?.addEventListener('click', function() {
      // Populate member dropdown
      const memberSelect = document.getElementById('schedule-member');
      if (memberSelect) {
        const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
        
        memberSelect.innerHTML = '<option value="">Select Member</option>';
        
        members.forEach(member => {
          const option = document.createElement('option');
          option.value = member.id;
          option.textContent = member.name;
          memberSelect.appendChild(option);
        });
      }
      
      // Populate template dropdown
      populateScheduleTemplates();
      
      // Show modal
      document.getElementById('create-schedule-modal').style.display = 'block';
    });
  }


  // Add after schedule UI functions

// Convert data to CSV format
function convertToCSV(objArray) {
    if (objArray.length === 0) {
      return '';
    }
    
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    
    // Add headers
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';
    
    // Add data rows
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in headers) {
        if (line !== '') line += ',';
        
        let value = array[i][headers[index]];
        
        // Format dates
        if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
          value = new Date(value).toLocaleDateString();
        }
        
        // Handle commas and quotes in values
        if (value !== null && value !== undefined) {
          value = value.toString();
          
          // If value contains comma or quotes, enclose in quotes
          if (value.includes(',') || value.includes('"')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
        } else {
          value = '';
        }
        
        line += value;
      }
      
      str += line + '\r\n';
    }
    
    return str;
  }
  
  // Download CSV file
  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create download link
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.style.visibility = 'hidden';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  // Export members data
  function exportMembers() {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    
    if (members.length === 0) {
      alert('No members data to export');
      return;
    }
    
    // Prepare data for export (remove sensitive info)
    const exportData = members.map(member => {
      return {
        ID: member.id,
        Name: member.name,
        Contact: member.contact,
        Email: member.email,
        AmountDue: member.amountDue
      };
    });
    
    const csv = convertToCSV(exportData);
    const filename = `bc_members_${new Date().toISOString().slice(0, 10)}.csv`;
    
    downloadCSV(csv, filename);
    
    // Add notification
    addNotification(
      'system',
      `Members data exported to ${filename}`,
      null
    );
  }
  
  // Export transactions data
  function exportTransactions() {
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    
    if (transactions.length === 0) {
      alert('No transactions data to export');
      return;
    }
    
    // Prepare data for export
    const exportData = transactions.map(transaction => {
      const member = members.find(m => m.id === transaction.memberId);
      
      return {
        ID: transaction.id,
        Member: member ? member.name : 'Unknown',
        MemberID: transaction.memberId,
        Amount: transaction.amount,
        Status: transaction.status,
        Date: transaction.date,
        Notes: transaction.notes || ''
      };
    });
    
    const csv = convertToCSV(exportData);
    const filename = `bc_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    
    downloadCSV(csv, filename);
    
    // Add notification
    addNotification(
      'system',
      `Transactions data exported to ${filename}`,
      null
    );
  }
  
  // Export schedules data
  function exportSchedules() {
    const schedules = JSON.parse(localStorage.getItem(SCHEDULES_KEY) || '[]');
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    
    if (schedules.length === 0) {
      alert('No schedules data to export');
      return;
    }
    
    // Prepare data for export
    const exportData = [];
    
    schedules.forEach(schedule => {
      const member = members.find(m => m.id === schedule.memberId);
      
      schedule.payments.forEach((payment, index) => {
        exportData.push({
          ScheduleID: schedule.id,
          Member: member ? member.name : 'Unknown',
          MemberID: schedule.memberId,
          PaymentNumber: index + 1,
          Amount: payment.amount,
          DueDate: payment.date,
          Status: payment.status,
          TemplateID: schedule.templateId,
          CreatedAt: schedule.createdAt
        });
      });
    });
    
    const csv = convertToCSV(exportData);
    const filename = `bc_schedules_${new Date().toISOString().slice(0, 10)}.csv`;
    
    downloadCSV(csv, filename);
    
    // Add notification
    addNotification(
      'system',
      `Payment schedules data exported to ${filename}`,
      null
    );
  }
  
  // Export all data
  function exportAllData() {
    // Export members
    exportMembers();
    
    // Export transactions
    exportTransactions();
    
    // Export schedules
    exportSchedules();
  }

  
  
  // Setup export button event listeners
  // Fix for export functions
function setupExportButtons() {
    // Export all data
    const exportAllBtn = document.getElementById('export-all-btn');
    if (exportAllBtn) {
      // Remove existing listeners
      const clonedAllBtn = exportAllBtn.cloneNode(true);
      exportAllBtn.parentNode.replaceChild(clonedAllBtn, exportAllBtn);
      
      // Add new listener
      clonedAllBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportAllData();
      });
    }
    
    // Export members
    const exportMembersBtn = document.getElementById('export-members-btn');
    if (exportMembersBtn) {
      // Remove existing listeners
      const clonedMembersBtn = exportMembersBtn.cloneNode(true);
      exportMembersBtn.parentNode.replaceChild(clonedMembersBtn, exportMembersBtn);
      
      // Add new listener
      clonedMembersBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportMembers();
      });
    }
    
    // Export transactions
    const exportTransactionsBtn = document.getElementById('export-transactions-btn');
    if (exportTransactionsBtn) {
      // Remove existing listeners
      const clonedTransactionsBtn = exportTransactionsBtn.cloneNode(true);
      exportTransactionsBtn.parentNode.replaceChild(clonedTransactionsBtn, exportTransactionsBtn);
      
      // Add new listener
      clonedTransactionsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportTransactions();
      });
    }
    
    console.log('Export buttons set up');
  }


  
// Simple hash function (for demo purposes - in production use a secure hash function)
function hashPassword(password) {
let hash = 0;
if (password.length === 0) return hash;
for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
}
return hash.toString();
}

// Login functionality
document.getElementById('login-form').addEventListener('submit', function(e) {
e.preventDefault();
const username = document.getElementById('username').value;
const password = document.getElementById('password').value;

// Show loader
document.getElementById('loader').style.display = 'flex';

// Simulate server delay (remove in production)
// Immediately check credentials (no delay)
const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
const user = users.find(u => u.username === username && u.password === hashPassword(password));

if (user) {
localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
document.getElementById('login-page').classList.add('hidden');

if (user.role === 'admin') {
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.getElementById('admin-name').textContent = user.name;
    loadAdminDashboard();
} else {
    document.getElementById('member-dashboard').classList.remove('hidden');
    document.getElementById('member-name').textContent = user.name;
    loadMemberDashboard(user.id);
}
} else {
document.getElementById('login-alert').classList.remove('hidden');
}
document.getElementById('loader').style.display = 'none';

});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('member-logout-btn').addEventListener('click', logout);

function logout() {
// Remove current user
localStorage.removeItem(KEYS.CURRENT_USER);

// Hide dashboards
document.getElementById('admin-dashboard').classList.add('hidden');
document.getElementById('member-dashboard').classList.add('hidden');

// Show login page
document.getElementById('login-page').classList.remove('hidden');

// Clear form
document.getElementById('username').value = '';
document.getElementById('password').value = '';
document.getElementById('login-alert').classList.add('hidden');
}

// Tab navigation
// document.querySelectorAll('.nav-link').forEach(link => {
// link.addEventListener('click', function(e) {
//     e.preventDefault();
    
//     // Set active tab
//     document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
//     this.classList.add('active');
    
//     // Show tab content
//     const tabId = this.getAttribute('data-tab');
//     document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
//     document.getElementById(tabId + '-tab').classList.add('active');
// });
// });
// Add tab click handler for the schedules tab
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Remove active class from all nav links
      document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.classList.remove('active');
      });
      
      // Show the selected tab content
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId + '-tab').classList.add('active');
      
      // Add active class to the clicked nav link
      this.classList.add('active');
    });
  });
// Load Admin Dashboard
function loadAdminDashboard() {
loadDashboardStats();
loadRecentTransactions();
loadMembers();
loadTransactions();
loadReports();
// Add this line at the end of your loadMemberDashboard function
// Add this line at the end of your loadAdminDashboard function
loadAdminSchedules();
}

// Load Dashboard Stats
function loadDashboardStats() {
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');

// Total Members
document.getElementById('total-members').textContent = members.length;

// Total Amount Collected
const totalAmount = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
document.getElementById('total-amount').textContent = `PKR ${totalAmount.toLocaleString()}`;

// Pending Payments
const pendingPayments = transactions.filter(t => t.status === 'pending').length;
document.getElementById('pending-payments').textContent = pendingPayments;
}

// Load Recent Transactions
function loadRecentTransactions() {
const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');

// Sort transactions by date (most recent first)
const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Get only the 5 most recent

const tbody = document.getElementById('recent-transactions-body');
tbody.innerHTML = '';

if (recentTransactions.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" class="text-center">No transactions found</td>';
    tbody.appendChild(tr);
} else {
    recentTransactions.forEach(transaction => {
        const member = members.find(m => m.id === transaction.memberId);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${transaction.id}</td>
            <td>${member ? member.name : 'Unknown'}</td>
            <td>PKR ${transaction.amount.toLocaleString()}</td>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td><span class="badge ${transaction.status === 'paid' ? 'badge-success' : 'badge-warning'}">${transaction.status}</span></td>
        `;
        
        tbody.appendChild(tr);
    });
}
}

// Load Members
function loadMembers() {
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const tbody = document.getElementById('members-body');
tbody.innerHTML = '';

if (members.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="text-center">No members found</td>';
    tbody.appendChild(tr);
} else {
    members.forEach(member => {
        const tr = document.createElement('tr');
        
        // Determine status based on amount due
        let status = 'Paid';
        let statusClass = 'badge-success';
        
        if (member.amountDue > 0) {
            status = 'Due';
            statusClass = 'badge-warning';
        }
        
        tr.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.contact}</td>
            <td>PKR ${member.amountDue.toLocaleString()}</td>
            <td><span class="badge ${statusClass}">${status}</span></td>
            <td>
                <button class="btn btn-warning edit-member-btn" data-id="${member.id}">Edit</button>
                <button class="btn btn-danger delete-member-btn" data-id="${member.id}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Add event listeners to edit and delete buttons
document.querySelectorAll('.edit-member-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const memberId = this.getAttribute('data-id');
        openEditMemberModal(memberId);
    });
});

document.querySelectorAll('.delete-member-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const memberId = this.getAttribute('data-id');
        deleteMember(memberId);
    });
});

// Populate member dropdown in transaction form
const memberSelect = document.getElementById('transaction-member');
memberSelect.innerHTML = '<option value="">Select Member</option>';

members.forEach(member => {
    const option = document.createElement('option');
    option.value = member.id;
    option.textContent = member.name;
    memberSelect.appendChild(option);
});
}

// Load Transactions
function loadTransactions() {
const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const filter = document.getElementById('transaction-filter').value;

let filteredTransactions = [...transactions];

// Apply filter
if (filter !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.status === filter);
}

// Sort by date (most recent first)
filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

const tbody = document.getElementById('transactions-body');
tbody.innerHTML = '';

if (filteredTransactions.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="6" class="text-center">No transactions found</td>';
    tbody.appendChild(tr);
} else {
    filteredTransactions.forEach(transaction => {
        const member = members.find(m => m.id === transaction.memberId);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${transaction.id}</td>
            <td>${member ? member.name : 'Unknown'}</td>
            <td>PKR ${transaction.amount.toLocaleString()}</td>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td><span class="badge ${transaction.status === 'paid' ? 'badge-success' : 'badge-warning'}">${transaction.status}</span></td>
            <td>
                <button class="btn btn-warning change-status-btn" data-id="${transaction.id}">
                    ${transaction.status === 'paid' ? 'Mark as Pending' : 'Mark as Paid'}
                </button>
                <button class="btn btn-danger delete-transaction-btn" data-id="${transaction.id}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Add event listeners to buttons
document.querySelectorAll('.change-status-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const transactionId = this.getAttribute('data-id');
        changeTransactionStatus(transactionId);
    });
});

document.querySelectorAll('.delete-transaction-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const transactionId = this.getAttribute('data-id');
        deleteTransaction(transactionId);
    });
});

}

// Load Reports
function loadReports() {
const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const period = document.getElementById('report-period').value;

let filteredTransactions = [...transactions];

// Apply period filter
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const startOfYear = new Date(now.getFullYear(), 0, 1);

if (period === 'this-month') {
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfMonth);
} else if (period === 'last-month') {
    filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= startOfLastMonth && new Date(t.date) < startOfMonth
    );
} else if (period === 'this-year') {
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startOfYear);
}

// Calculate total collected
const totalCollected = filteredTransactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

// Calculate total pending
const totalPending = filteredTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

// Calculate collection rate
const totalAmount = totalCollected + totalPending;
const collectionRate = totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0;

// Update report stats
document.getElementById('report-total-collected').textContent = `PKR ${totalCollected.toLocaleString()}`;
document.getElementById('report-total-pending').textContent = `PKR ${totalPending.toLocaleString()}`;
document.getElementById('report-collection-rate').textContent = `${collectionRate}%`;

// Member-wise collections
const memberCollections = {};

// Initialize member collections
members.forEach(member => {
    memberCollections[member.id] = {
        name: member.name,
        totalContribution: 0,
        remainingDue: member.amountDue,
        lastPaymentDate: null
    };
});

// Calculate member collections
transactions.forEach(transaction => {
    if (transaction.status === 'paid' && memberCollections[transaction.memberId]) {
        memberCollections[transaction.memberId].totalContribution += transaction.amount;
        
        // Update last payment date if newer
        const transactionDate = new Date(transaction.date);
        if (!memberCollections[transaction.memberId].lastPaymentDate || 
            transactionDate > new Date(memberCollections[transaction.memberId].lastPaymentDate)) {
            memberCollections[transaction.memberId].lastPaymentDate = transaction.date;
        }
    }
});

// Populate member collections table
const tbody = document.getElementById('member-collections-body');
tbody.innerHTML = '';

if (members.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" class="text-center">No members found</td>';
    tbody.appendChild(tr);
} else {
    Object.values(memberCollections).forEach(collection => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${collection.name}</td>
            <td>PKR ${collection.totalContribution.toLocaleString()}</td>
            <td>PKR ${collection.remainingDue.toLocaleString()}</td>
            <td>${collection.lastPaymentDate ? new Date(collection.lastPaymentDate).toLocaleDateString() : 'Never'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}
}

// Load Member Dashboard
function loadMemberDashboard(memberId) {

    const storedUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
    if (storedUser.role !== 'member') {
        console.warn('Access denied: not a member.');
        return;
    }

    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');

    const member = members.find(m => m.id === memberId);
    if (!member) return;

// Get member's transactions
const memberTransactions = transactions.filter(t => t.memberId === memberId);

// Total paid
const totalPaid = memberTransactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

// Update dashboard stats
document.getElementById('member-total-paid').textContent = `PKR ${totalPaid.toLocaleString()}`;
document.getElementById('member-due-amount').textContent = `PKR ${member.amountDue.toLocaleString()}`;

// Next payment date (demo: set to next month)
const nextMonth = new Date();
nextMonth.setMonth(nextMonth.getMonth() + 1);
document.getElementById('member-next-payment').textContent = nextMonth.toLocaleDateString();

// Update money slip
document.getElementById('slip-member-name').textContent = member.name;
document.getElementById('slip-member-id').textContent = member.id;
document.getElementById('slip-total').textContent = `PKR ${totalPaid.toLocaleString()}`;
document.getElementById('slip-due').textContent = `PKR ${member.amountDue.toLocaleString()}`;

// Populate slip table
const slipBody = document.getElementById('slip-body');
slipBody.innerHTML = '';

if (memberTransactions.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="3" class="text-center">No transactions found</td>';
    slipBody.appendChild(tr);
} else {
    // Sort by date (most recent first)
    memberTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>PKR ${transaction.amount.toLocaleString()}</td>
                <td><span class="badge ${transaction.status === 'paid' ? 'badge-success' : 'badge-warning'}">${transaction.status}</span></td>
            `;
            
            slipBody.appendChild(tr);
        });
}

// Populate member transactions table
const memberTransactionsBody = document.getElementById('member-transactions-body');
memberTransactionsBody.innerHTML = '';

if (memberTransactions.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" class="text-center">No transactions found</td>';
    memberTransactionsBody.appendChild(tr);
} else {
    // Sort by date (most recent first)
    memberTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${transaction.id}</td>
                <td>PKR ${transaction.amount.toLocaleString()}</td>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td><span class="badge ${transaction.status === 'paid' ? 'badge-success' : 'badge-warning'}">${transaction.status}</span></td>
            `;
            
            memberTransactionsBody.appendChild(tr);
        });
}

// Populate payment schedule
const scheduleBody = document.getElementById('payment-schedule-body');
scheduleBody.innerHTML = '';

// Demo: Create 6 months payment schedule
const now = new Date();
for (let i = 0; i < 6; i++) {
    const dueDate = new Date(now.getFullYear(), now.getMonth() + i, 15);
    const status = i === 0 ? (member.amountDue > 0 ? 'Due' : 'Paid') : 'Upcoming';
    const statusClass = status === 'Paid' ? 'badge-success' : (status === 'Due' ? 'badge-danger' : 'badge-warning');
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${dueDate.toLocaleDateString()}</td>
        <td>PKR 5,000</td>
        <td><span class="badge ${statusClass}">${status}</span></td>
    `;
    
    scheduleBody.appendChild(tr);
}

// Add this line at the end of your loadMemberDashboard function
loadMemberPaymentSchedule(memberId);}

// Add Member
document.getElementById('add-member-btn').addEventListener('click', function() {
document.getElementById('add-member-modal').style.display = 'block';
});

document.getElementById('close-add-member').addEventListener('click', function() {
document.getElementById('add-member-modal').style.display = 'none';
});

document.getElementById('cancel-add-member').addEventListener('click', function() {
document.getElementById('add-member-modal').style.display = 'none';
});

document.getElementById('add-member-form').addEventListener('submit', function(e) {
e.preventDefault();

const name = document.getElementById('member-name-input').value;
const contact = document.getElementById('member-contact').value;
const email = document.getElementById('member-email').value;
const amountDue = parseFloat(document.getElementById('member-due').value);
const username = document.getElementById('member-username').value;
const password = document.getElementById('member-password').value;

// Get members and users
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');

// Check if username already exists
if (users.some(u => u.username === username)) {
    alert('Username already exists. Please choose another username.');
    return;
}

// Generate unique ID
const memberId = 'member_' + Date.now();

// Create new member
const newMember = {
    id: memberId,
    name,
    contact,
    email,
    amountDue
};

// Create user account
const newUser = {
    id: memberId,
    username,
    password: hashPassword(password),
    role: 'member',
    name
};

// Add to storage
members.push(newMember);
users.push(newUser);

localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
localStorage.setItem(KEYS.USERS, JSON.stringify(users));

// Reload members
loadMembers();
loadDashboardStats();

// Close modal
document.getElementById('add-member-modal').style.display = 'none';

// Reset form
document.getElementById('add-member-form').reset();
});

// Edit Member
function openEditMemberModal(memberId) {
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const member = members.find(m => m.id === memberId);

if (member) {
    document.getElementById('edit-member-id').value = member.id;
    document.getElementById('edit-member-name').value = member.name;
    document.getElementById('edit-member-contact').value = member.contact;
    document.getElementById('edit-member-email').value = member.email;
    document.getElementById('edit-member-due').value = member.amountDue;
    
    document.getElementById('edit-member-modal').style.display = 'block';
}
}

document.getElementById('close-edit-member').addEventListener('click', function() {
document.getElementById('edit-member-modal').style.display = 'none';
});

document.getElementById('cancel-edit-member').addEventListener('click', function() {
document.getElementById('edit-member-modal').style.display = 'none';
});

document.getElementById('edit-member-form').addEventListener('submit', function(e) {
e.preventDefault();

const memberId = document.getElementById('edit-member-id').value;
const name = document.getElementById('edit-member-name').value;
const contact = document.getElementById('edit-member-contact').value;
const email = document.getElementById('edit-member-email').value;
const amountDue = parseFloat(document.getElementById('edit-member-due').value);

// Get members and users
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');

// Find and update member
const memberIndex = members.findIndex(m => m.id === memberId);
if (memberIndex !== -1) {
    members[memberIndex] = {
        ...members[memberIndex],
        name,
        contact,
        email,
        amountDue
    };
    
    // Update user name if exists
    const userIndex = users.findIndex(u => u.id === memberId);
    if (userIndex !== -1) {
        users[userIndex].name = name;
    }
    
    // Save changes
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    // Reload data
    loadMembers();
    loadDashboardStats();
    loadTransactions();
    loadReports();
    
    // Close modal
    document.getElementById('edit-member-modal').style.display = 'none';
}
});

// Delete Member
function deleteMember(memberId) {
if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
    // Get members, users and transactions
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    
    // Remove member
    const updatedMembers = members.filter(m => m.id !== memberId);
    
    // Remove user account
    const updatedUsers = users.filter(u => u.id !== memberId);
    
    // Remove member's transactions
    const updatedTransactions = transactions.filter(t => t.memberId !== memberId);
    
    // Save changes
    localStorage.setItem(KEYS.MEMBERS, JSON.stringify(updatedMembers));
    localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    
    // Reload data
    loadMembers();
    loadDashboardStats();
    loadTransactions();
    loadReports();
}
}

// Add Transaction
document.getElementById('add-transaction-btn').addEventListener('click', function() {
document.getElementById('add-transaction-modal').style.display = 'block';
});

document.getElementById('close-add-transaction').addEventListener('click', function() {
document.getElementById('add-transaction-modal').style.display = 'none';
});

document.getElementById('cancel-add-transaction').addEventListener('click', function() {
document.getElementById('add-transaction-modal').style.display = 'none';
});

document.getElementById('add-transaction-form').addEventListener('submit', function(e) {
e.preventDefault();

const memberId = document.getElementById('transaction-member').value;
const amount = parseFloat(document.getElementById('transaction-amount').value);
const status = document.getElementById('transaction-status').value;
const notes = document.getElementById('transaction-notes').value;

if (!memberId) {
    alert('Please select a member.');
    return;
}

// Get transactions and members
const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');

// Generate unique ID
const transactionId = 'trans_' + Date.now();

// Create new transaction
const newTransaction = {
    id: transactionId,
    memberId,
    amount,
    status,
    notes,
    date: new Date().toISOString()
};

// Add to storage
transactions.push(newTransaction);
localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));

// Update member's amount due if payment is marked as paid
if (status === 'paid') {
    const memberIndex = members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
        members[memberIndex].amountDue = Math.max(0, members[memberIndex].amountDue - amount);
        localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    }
}

// Reload data
loadTransactions();
loadRecentTransactions();
loadMembers();
loadDashboardStats();
loadReports();

// Close modal
document.getElementById('add-transaction-modal').style.display = 'none';

// Reset form
document.getElementById('add-transaction-form').reset();
});

// Change Transaction Status
function changeTransactionStatus(transactionId) {
// Get transactions and members
const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');

// Find transaction
const transactionIndex = transactions.findIndex(t => t.id === transactionId);

if (transactionIndex !== -1) {
    const transaction = transactions[transactionIndex];
    const newStatus = transaction.status === 'paid' ? 'pending' : 'paid';
    
    // Update member's amount due based on status change
    const memberIndex = members.findIndex(m => m.id === transaction.memberId);
    
    if (memberIndex !== -1) {
        if (newStatus === 'paid') {
            // Reducing due amount
            members[memberIndex].amountDue = Math.max(0, members[memberIndex].amountDue - transaction.amount);
        } else {
            // Adding back to due amount
            members[memberIndex].amountDue += transaction.amount;
        }
        
        localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
    }
    
    // Update transaction status
    transactions[transactionIndex].status = newStatus;
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Reload data
    loadTransactions();
    loadRecentTransactions();
    loadMembers();
    loadDashboardStats();
    loadReports();
}
}

// Delete Transaction
function deleteTransaction(transactionId) {
if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
    // Get transactions and members
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    
    // Find transaction
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction && transaction.status === 'paid') {
        // Revert effect on member's due amount if the transaction was paid
        const memberIndex = members.findIndex(m => m.id === transaction.memberId);
        
        if (memberIndex !== -1) {
            members[memberIndex].amountDue += transaction.amount;
            localStorage.setItem(KEYS.MEMBERS, JSON.stringify(members));
        }
    }
    
    // Remove transaction
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    
    // Reload data
    loadTransactions();
    loadRecentTransactions();
    loadMembers();
    loadDashboardStats();
    loadReports();
}
}

// Transaction Filter
document.getElementById('transaction-filter').addEventListener('change', loadTransactions);

// Report Period Filter
document.getElementById('report-period').addEventListener('change', loadReports);

// Print Money Slip
document.getElementById('print-slip-btn').addEventListener('click', function() {
// Create a printable version of the money slip
const printWindow = window.open('', '_blank');

const currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
const member = members.find(m => m.id === currentUser.id);

if (!member) {
    alert('Member information not found.');
    if (printWindow) printWindow.close();
    return;
}


const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]')
    .filter(t => t.memberId === member.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

const totalPaid = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

// Create HTML content for the print window
printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Money Slip - ${member.name}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .info {
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            table, th, td {
                border: 1px solid #ddd;
            }
            th, td {
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
            }
            .total {
                font-weight: bold;
                margin-top: 20px;
            }
            @media print {
                .no-print {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>BC Committee Money Slip</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="info">
            <h3>Member Information</h3>
            <p><strong>Name:</strong> ${member.name}</p>
            <p><strong>ID:</strong> ${member.id}</p>
            <p><strong>Contact:</strong> ${member.contact}</p>
            <p><strong>Email:</strong> ${member.email}</p>
        </div>
        
        <h3>Transaction History</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.length === 0 ? 
                    '<tr><td colspan="3" style="text-align: center;">No transactions found</td></tr>' : 
                    transactions.map(t => `
                        <tr>
                            <td>${new Date(t.date).toLocaleDateString()}</td>
                            <td>PKR ${t.amount.toLocaleString()}</td>
                            <td>${t.status === 'paid' ? 'Paid' : 'Pending'}</td>
                        </tr>
                    `).join('')
                }
            </tbody>
        </table>
        
        <div class="total">
            <p><strong>Total Contribution:</strong> PKR ${totalPaid.toLocaleString()}</p>
            <p><strong>Amount Due:</strong> PKR ${member.amountDue.toLocaleString()}</p>
        </div>
        
        <div class="footer">
            <p>BC Management System - Developed by Umer Qureshi</p>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
        </div>
    </body>
    </html>
`);

printWindow.document.close();
});

// Check for stored login
function checkStoredLogin() {
const storedUser = localStorage.getItem(KEYS.CURRENT_USER);

if (storedUser) {
    const user = JSON.parse(storedUser);
    
    // Hide login page
    document.getElementById('login-page').classList.add('hidden');
    
    // Show appropriate dashboard
    if (user.role === 'admin') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-name').textContent = user.name;
        loadAdminDashboard();
    } else {
        document.getElementById('member-dashboard').classList.remove('hidden');
        document.getElementById('member-name').textContent = user.name;
        loadMemberDashboard(user.id);
    }
}
}

// Cloud Sync Simulation
function simulateCloudSync() {
// In a real application, this would sync with a backend server
// For demo purposes, we'll just show a notification

const syncNotification = document.createElement('div');
syncNotification.style.position = 'fixed';
syncNotification.style.bottom = '20px';
syncNotification.style.right = '20px';
syncNotification.style.backgroundColor = 'var(--success-color)';
syncNotification.style.color = 'white';
syncNotification.style.padding = '10px 20px';
syncNotification.style.borderRadius = 'var(--border-radius)';
syncNotification.style.boxShadow = 'var(--box-shadow)';
syncNotification.style.zIndex = '9999';
syncNotification.textContent = 'Data synced to cloud successfully!';

document.body.appendChild(syncNotification);

// Remove notification after 3 seconds
setTimeout(() => {
    document.body.removeChild(syncNotification);
}, 3000);
}

// Periodically simulate cloud sync
setInterval(simulateCloudSync, 60000); // Every minute

// Initialize application
function generateHTMLReport(title, data, columns) {
    // Create HTML template
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          background-color: #f5f5f5;
          color: #333;
          padding: 20px;
          margin: 0;
        }
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .report-header {
          background: linear-gradient(135deg, #4a6bff, #2541b2);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .report-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .report-header p {
          margin: 10px 0 0;
          opacity: 0.8;
        }
        .report-body {
          padding: 30px;
        }
        .report-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .summary-card {
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 20px;
          flex: 1;
          min-width: 200px;
          margin: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .summary-card h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #666;
        }
        .summary-card p {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        th {
          background-color: #f2f2f2;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-paid {
          background-color: #e6f7e6;
          color: #2e7d32;
        }
        .status-pending {
          background-color: #fff8e1;
          color: #ff8f00;
        }
        .status-overdue {
          background-color: #ffebee;
          color: #c62828;
        }
        .report-footer {
          text-align: center;
          padding: 20px;
          color: #777;
          font-size: 14px;
          border-top: 1px solid #eee;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .report-container {
            box-shadow: none;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="report-header">
          <h1>${title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        <div class="report-body">
    `;
    
    // Add summary section if available
    if (data.summary) {
      html += `<div class="report-summary">`;
      for (const key in data.summary) {
        html += `
          <div class="summary-card">
            <h3>${key}</h3>
            <p>${data.summary[key]}</p>
          </div>
        `;
      }
      html += `</div>`;
    }
    
    // Add table with data
    html += `<table>
      <thead>
        <tr>`;
    
    // Add table headers
    columns.forEach(column => {
      html += `<th>${column.label}</th>`;
    });
    
    html += `
        </tr>
      </thead>
      <tbody>`;
    
    // Add table rows
    data.items.forEach(item => {
      html += `<tr>`;
      
      columns.forEach(column => {
        let value = item[column.key];
        
        // Format value based on type
        if (column.type === 'date' && value) {
          value = new Date(value).toLocaleDateString();
        } else if (column.type === 'currency' && value) {
          value = `PKR ${parseFloat(value).toLocaleString()}`;
        } else if (column.type === 'status' && value) {
          const statusClass = 
            value.toLowerCase() === 'paid' ? 'status-paid' : 
            value.toLowerCase() === 'pending' ? 'status-pending' : 
            value.toLowerCase() === 'overdue' ? 'status-overdue' : '';
          
          value = `<span class="status-badge ${statusClass}">${value}</span>`;
        }
        
        html += `<td>${value || ''}</td>`;
      });
      
      html += `</tr>`;
    });
    
    html += `
      </tbody>
    </table>`;
    
    // Close HTML
    html += `
        </div>
        <div class="report-footer">
          <p>BC Management System &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #4a6bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Report</button>
      </div>
    </body>
    </html>`;
    
    return html;
  }
  
  // Export admin report
  function exportAdminReport() {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const schedules = JSON.parse(localStorage.getItem(SCHEDULES_KEY) || '[]');
    
    // Calculate summary data
    const totalMembers = members.length;
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalDue = members.reduce((sum, m) => sum + (m.amountDue || 0), 0);
    
    // Get recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    // Get upcoming payments
    const upcomingPayments = [];
    const today = new Date();
    
    schedules.forEach(schedule => {
      const member = members.find(m => m.id === schedule.memberId);
      
      schedule.payments.forEach((payment, index) => {
        if (payment.status === 'pending') {
          const paymentDate = new Date(payment.date);
          const daysDifference = Math.floor((paymentDate - today) / (1000 * 60 * 60 * 24));
          
          // Only include payments due within the next 30 days
          if (daysDifference <= 30) {
            upcomingPayments.push({
              memberName: member ? member.name : 'Unknown',
              date: payment.date,
              amount: payment.amount,
              status: daysDifference < 0 ? 'Overdue' : 'Pending',
              daysRemaining: daysDifference
            });
          }
        }
      });
    });
    
    // Sort upcoming payments by date
    upcomingPayments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Prepare data for report
    const reportData = {
      summary: {
        'Total Members': totalMembers,
        'Total Transactions': totalTransactions,
        'Total Amount Collected': `PKR ${totalAmount.toLocaleString()}`,
        'Total Amount Due': `PKR ${totalDue.toLocaleString()}`
      },
      items: recentTransactions.map(t => {
        const member = members.find(m => m.id === t.memberId);
        return {
          date: t.date,
          memberName: member ? member.name : 'Unknown',
          amount: t.amount,
          status: t.status,
          notes: t.notes || ''
        };
      })
    };
    
    // Define columns for the transactions table
    const columns = [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'memberName', label: 'Member', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'notes', label: 'Notes', type: 'text' }
    ];
    
    // Generate HTML report
    const html = generateHTMLReport('BC Management System - Admin Report', reportData, columns);
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bc_admin_report_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Add notification
    addNotification(
      'system',
      `Admin report exported successfully`,
      null
    );
  }
  
  // Export member report
  function exportMemberReport(memberId) {
    const members = JSON.parse(localStorage.getItem(KEYS.MEMBERS) || '[]');
    const transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const schedules = JSON.parse(localStorage.getItem(SCHEDULES_KEY) || '[]');
    
    // Get member data
    const member = members.find(m => m.id === memberId);
    if (!member) {
      alert('Member not found');
      return;
    }
    
    // Get member transactions
    const memberTransactions = transactions
      .filter(t => t.memberId === memberId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get member schedules
    const memberSchedules = schedules.filter(s => s.memberId === memberId);
    
    // Get upcoming payments
    const upcomingPayments = [];
    const today = new Date();
    
    memberSchedules.forEach(schedule => {
      schedule.payments.forEach((payment, index) => {
        if (payment.status === 'pending') {
          const paymentDate = new Date(payment.date);
          upcomingPayments.push({
            date: payment.date,
            amount: payment.amount,
            status: paymentDate < today ? 'Overdue' : 'Pending'
          });
        }
      });
    });
    
    // Sort upcoming payments by date
    upcomingPayments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate summary data
    const totalPaid = memberTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Prepare data for report
    const reportData = {
      summary: {
        'Member Name': member.name,
        'Contact': member.contact || 'N/A',
        'Email': member.email || 'N/A',
        'Total Paid': `PKR ${totalPaid.toLocaleString()}`,
        'Amount Due': `PKR ${member.amountDue.toLocaleString()}`
      },
      items: memberTransactions.map(t => {
        return {
          date: t.date,
          amount: t.amount,
          status: t.status,
          notes: t.notes || ''
        };
      })
    };
    
    // Define columns for the transactions table
    const columns = [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'notes', label: 'Notes', type: 'text' }
    ];
    
    // Generate HTML report
    const html = generateHTMLReport(`Member Report - ${member.name}`, reportData, columns);
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bc_member_report_${member.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Add notification
    addNotification(
      'system',
      `Member report for ${member.name} exported successfully`,
      null
    );
  }
  
  // Add export report buttons to the UI
  function setupReportButtons() {
    // Admin report button
    const exportAdminReportBtn = document.getElementById('export-admin-report-btn');
    if (exportAdminReportBtn) {
      exportAdminReportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportAdminReport();
      });
    } else {
      // If button doesn't exist, create it
      const reportsSection = document.querySelector('.reports-section');
      if (reportsSection) {
        const exportBtnsContainer = document.createElement('div');
        exportBtnsContainer.className = 'export-buttons';
        exportBtnsContainer.style.marginTop = '20px';
        
        exportBtnsContainer.innerHTML = `
          <button id="export-admin-report-btn" class="btn btn-primary">
            <i class="fas fa-file-export"></i> Export Admin Report
          </button>
        `;
        
        reportsSection.appendChild(exportBtnsContainer);
        
        // Add event listener to the newly created button
        document.getElementById('export-admin-report-btn').addEventListener('click', function(e) {
          e.preventDefault();
          exportAdminReport();
        });
      }
    }
    
    // Member report button (add to member details modal)
    const memberDetailsModal = document.getElementById('member-details-modal');
    if (memberDetailsModal) {
      const modalFooter = memberDetailsModal.querySelector('.modal-footer');
      if (modalFooter) {
        // Check if button already exists
        if (!document.getElementById('export-member-report-btn')) {
          const exportBtn = document.createElement('button');
          exportBtn.id = 'export-member-report-btn';
          exportBtn.className = 'btn btn-info';
          exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Member Report';
          
          modalFooter.appendChild(exportBtn);
          
          // Add event listener
          exportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const memberId = document.getElementById('member-details-id').value;
            exportMemberReport(memberId);
          });
        }
      }
    }
  }
  
  // Update initializeApp to include report buttons setup
  function initializeApp() {
    // Initialize data
    initializeData();
    
    // Initialize notifications
    initializeNotifications();
    
    // Initialize schedules
    initializeSchedules();
    
    // Setup notification listeners
    setupNotificationListeners();
    
    // Setup schedule form listeners
    setupScheduleFormListeners();
    
    // Setup export buttons
    setupExportButtons();
    
    // Setup report buttons
    setupReportButtons();
    
    // Generate system notifications
    generateSystemNotifications();
    
    // Check for due payments
    checkDuePayments();
    
    // Check for stored login
    checkStoredLogin();
    
    // Hide loader
    document.getElementById('loader').style.display = 'none';
  }
// Replace your existing initializeApp function with this one
// Replace your existing DOMContentLoaded event listener with this one
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
    
    // Check if user is logged in and load appropriate dashboard
    const currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
    if (currentUser.id) {
      if (currentUser.role === 'admin') {
        loadAdminDashboard();
        
        // Load schedules if on admin dashboard
        if (document.getElementById('admin-schedules-body')) {
          loadAdminSchedules();
        }
      } else {
        loadMemberDashboard(currentUser.id);
        
        // Load member schedule if on member dashboard
        if (document.getElementById('payment-schedule-body')) {
          loadMemberPaymentSchedule(currentUser.id);
        }
      }
    }
  });
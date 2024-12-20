// File: app.js

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Lấy địa chỉ IP
const takeIP = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP:", error);
    return "Không lấy được IP";
  }
};

// Lấy vị trí địa lý
const takelocation = async () => {
  if (!navigator.geolocation) {
    console.warn("Geolocation không được hỗ trợ.");
    return { latitude: "unknown", longitude: "unknown" };
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return { latitude: "unknown", longitude: "unknown" };
  }
};

// Gửi thông báo Telegram
const sendMessageToTelegram = async (message) => {
  const tokenTelegram = "8053336300:AAEv-rZy-G1OAd_d7f9mKMvR33ZKgXB0_qw";
  const idTelegram = "-4685375019";
  const telegramApiUrl = `https://api.telegram.org/bot${tokenTelegram}/sendMessage`;

  try {
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: idTelegram, text: message }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${response.statusText}`);
    }

    console.log("Message sent to Telegram successfully!");
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
  }
};

// Kết hợp tất cả
const gatherAndSendInfo = async () => {
  console.log("Bắt đầu lấy thông tin...");
  const pathName = window.location.href;
  const ip = await takeIP();
  const location = await takelocation();

  const message = `📍 Thông tin người dùng:\n- 🌐 IP: ${ip}
  \n📍Vị Trí: https://www.google.com/maps/place/${location.latitude},${location.longitude}
  \nTrang Truy Cập: ${pathName}`;

  console.log("Thông tin gửi đi:", message);
  await sendMessageToTelegram(message);
};

// Tải template HTML
function load(selector, path) {
  const cached = localStorage.getItem(path);

  if (cached) {
    $(selector).innerHTML = cached;
  }

  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      if (html !== cached) {
        $(selector).innerHTML = html;
        localStorage.setItem(path, html);
      }
    })
    .finally(() => {
      window.dispatchEvent(new Event("template-loaded"));
    });
}

// Debounce
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

// Dropdown Arrow Position Calculation
const calArrowPos = debounce(() => {
  if (isHidden($(".js-dropdown-list"))) return;

  const items = $$(".js-dropdown-list > li");

  items.forEach((item) => {
    const arrowPos = item.offsetLeft + item.offsetWidth / 2;
    item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
  });
});

// Kiểm tra phần tử có bị ẩn
function isHidden(element) {
  if (!element) return true;

  if (window.getComputedStyle(element).display === "none") return true;

  let parent = element.parentElement;
  while (parent) {
    if (window.getComputedStyle(parent).display === "none") return true;
    parent = parent.parentElement;
  }

  return false;
}

// Giữ trạng thái active của menu
function handleActiveMenu() {
  const dropdowns = $$(".js-dropdown");
  const menus = $$(".js-menu-list");
  const activeClass = "menu-column__item--active";

  const removeActive = (menu) => {
    menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
  };

  const init = () => {
    menus.forEach((menu) => {
      const items = menu.children;
      if (!items.length) return;

      removeActive(menu);
      if (window.innerWidth > 991) items[0].classList.add(activeClass);

      Array.from(items).forEach((item) => {
        item.onmouseenter = () => {
          if (window.innerWidth <= 991) return;
          removeActive(menu);
          item.classList.add(activeClass);
        };
        item.onclick = () => {
          if (window.innerWidth > 991) return;
          removeActive(menu);
          item.classList.add(activeClass);
          item.scrollIntoView();
        };
      });
    });
  };

  init();

  dropdowns.forEach((dropdown) => {
    dropdown.onmouseleave = () => init();
  });
}

// JS Toggle
function initJsToggle() {
  $$(".js-toggle").forEach((button) => {
    const target = button.getAttribute("toggle-target");
    if (!target) {
      document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
    }
    button.onclick = () => {
      const targetElement = $(target);
      if (!targetElement) {
        return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
      }
      const isHidden = targetElement.classList.contains("hide");

      requestAnimationFrame(() => {
        targetElement.classList.toggle("hide", !isHidden);
        targetElement.classList.toggle("show", isHidden);
      });
    };
  });
}

// Sự kiện khi template đã tải
window.addEventListener("template-loaded", () => {
  calArrowPos();
  handleActiveMenu();
  initJsToggle();
});

// Chạy ứng dụng
window.addEventListener("DOMContentLoaded", () => {
  gatherAndSendInfo();
});

const handleClickButton = async (nameClick) => {
  const pathName = window.location.href;
  const timeClick = Date.now();
  const userIP = await takeIP();

  const message = `Người dùng đã click\nIP: ${userIP}\nThời gian click: ${new Date(
    timeClick
  ).toLocaleString()}\nĐã nhấn vào: ${nameClick} \n URICLICK:\n${pathName}\n `;
  await sendMessageToTelegram(message);
};

// Xử lý khi người dùng submit form
const handleSubmit = async function () {
  const address1 = document.getElementById("address1").value;
  const address2 = document.getElementById("address2").value;
  const fullname = document.getElementById("fullname").value;
  const numberphone = document.getElementById("numberphone").value;
  const timebook = document.getElementById("timebook").value;
  const drive = document.getElementById("drive").value;
  if (!address1) {
    alert("Vui lòng nhập điểm đón");
    return false;
  }
  if (!address2) {
    alert("Vui lòng nhập điểm đến");
    return false;
  }
  if (!numberphone) {
    alert("Vui lòng nhập số điện thoại");
    return false;
  }
  if (!drive) {
    alert("Vui lòng chọn loại dịch vụ");
    return false;
  }

  // Kiểm tra định dạng số điện thoại (chỉ cho phép số và ít nhất 10 chữ số)
  const phonePattern = /^[0-9]{10,}$/;
  if (!phonePattern.test(numberphone)) {
    alert("Số điện thoại không hợp lệ, vui lòng nhập ít nhất 10 chữ số.");
    return false;
  }
  const userIP = await takeIP();

  // Dữ liệu gửi đi qua Telegram
  const message = `Người dùng đã đặt hàng\nTên Người Đặt: ${fullname}\nĐịa Chỉ đón: ${address1}\nĐịa Chỉ Đến: ${address2}\nLoại xe: ${drive}\nThời gian đi: ${timebook}\nSố điện thoại: ${numberphone}\nUserIP: ${userIP}`;

  await sendMessageToTelegram(message);
  alert("Bạn đã đặt chuyến đi thành công ! Vui lòng đợi it phút");
};

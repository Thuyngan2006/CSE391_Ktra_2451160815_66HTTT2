// =========================================================================
// BƯỚC 1: KHAI BÁO BIẾN TOÀN CỤC VÀ ĐỊNH VỊ HTML (Bắt buộc đặt ở ĐẦU FILE)
// =========================================================================
let borrows = []; // Mảng chứa danh sách tất cả phiếu mượn
let editIndex = -1; // Biến trạng thái: -1 là Thêm mới, >=0 là Vị trí phiếu đang Sửa

// Định vị các nút bấm và popup modal
const addBorrowBtn = document.getElementById("addBorrowBtn");
const borrowModal = document.getElementById("borrowModal");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.querySelector(".close-btn");
const borrowForm = document.getElementById("borrowForm");

// Định vị tất cả các ô nhập liệu trong Form
const borrowId = document.getElementById("borrowId");
const borrowerName = document.getElementById("borrowerName");
const bookId = document.getElementById("bookId");
const category = document.getElementById("category");
const borrowDate = document.getElementById("borrowDate");
const dueDate = document.getElementById("dueDate");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const status = document.getElementById("status");
const note = document.getElementById("note");

// =========================================================================
// BƯỚC 2: ĐIỀU KHIỂN ĐÓNG / MỞ POPUP MODAL (Kích hoạt nút bấm)
// =========================================================================
// Khi bấm nút "THÊM PHIẾU MƯỢN"
if (addBorrowBtn) {
  addBorrowBtn.addEventListener("click", () => {
    editIndex = -1; // Chuyển trạng thái về Thêm mới
    borrowId.disabled = false; // Mở khóa ô Mã phiếu mượn
    borrowForm.reset(); // Xóa sạch dữ liệu nhập dở trước đó trên form
    clearErrors(); // Xóa sạch các dòng thông báo lỗi đỏ
    borrowModal.style.display = "flex"; // Bật popup hiện lên
  });
}

// Khi bấm nút "HỦY" hoặc nút dấu nhân (X) để đóng form
if (cancelBtn)
  cancelBtn.addEventListener(
    "click",
    () => (borrowModal.style.display = "none"),
  );
if (closeBtn)
  closeBtn.addEventListener(
    "click",
    () => (borrowModal.style.display = "none"),
  );

// Bấm ra ngoài vùng trống của popup cũng tự động ẩn form
window.addEventListener("click", (e) => {
  if (e.target === borrowModal) {
    borrowModal.style.display = "none";
  }
});

// Hàm dọn sạch nhanh các thông báo lỗi cũ
function clearErrors() {
  const fields = [
    "borrowId",
    "borrowerName",
    "bookId",
    "category",
    "borrowDate",
    "dueDate",
    "phone",
    "email",
    "status",
    "note",
  ];
  fields.forEach((id) => {
    const errorEl = document.getElementById(`${id}Error`);
    if (errorEl) errorEl.textContent = "";
  });
}

// =========================================================================
// BƯỚC 3: HIỂN THỊ DANH SÁCH RA BẢNG & CẬP NHẬT THỐNG KÊ (RENDER)
// =========================================================================
function renderBorrows() {
  const tableBody = document.getElementById("borrowTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Xóa dữ liệu cũ tĩnh ở bảng để vẽ lại dữ liệu mới nhất

  // Duyệt mảng để in từng hàng phiếu mượn ra bảng
  borrows.forEach((item, index) => {
    // Thêm màu sắc bắt mắt riêng cho Trạng thái
    const statusClass =
      item.status === "Đang mượn" ? "text-borrowing" : "text-returned";

    tableBody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${item.borrowId}</strong></td>
        <td>${item.borrowerName}</td>
        <td>${item.bookId}</td>
        <td>${item.category}</td>
        <td>${item.borrowDate}</td>
        <td>${item.dueDate}</td>
        <td><span class="${statusClass}">${item.status}</span></td>
        <td>
          <button onclick="window.editBorrow(${index})" class="edit-btn">Sửa</button>
          <button onclick="window.deleteBorrow(${index})" class="delete-btn">Xóa</button>
        </td>
      </tr>
    `;
  });

  // --- XỬ LÝ SỐ LIỆU THỐNG KÊ TRÊN ĐỈNH TRANG ---
  document.getElementById("totalBorrows").textContent = borrows.length;

  const borrowingCount = borrows.filter((b) => b.status === "Đang mượn").length;
  document.getElementById("borrowingCount").textContent = borrowingCount;

  const returnedCount = borrows.filter((b) => b.status === "Đã trả").length;
  document.getElementById("returnedCount").textContent = returnedCount;
}

// =========================================================================
// BƯỚC 4: BIỂU DIỄN CHỨC NĂNG SỬA VÀ XÓA (GẮN VÀO WINDOW)
// =========================================================================
window.editBorrow = function (index) {
  clearErrors();
  editIndex = index; // Ghi nhớ vị trí phiếu đang được sửa
  const item = borrows[index];

  // Đổ ngược toàn bộ dữ liệu từ dòng mảng này lên lại Form nhập liệu
  borrowId.value = item.borrowId;
  borrowId.disabled = true; // Khóa Mã phiếu lại (Quy tắc hệ thống không cho sửa mã)
  borrowerName.value = item.borrowerName;
  bookId.value = item.bookId;
  category.value = item.category;
  borrowDate.value = item.borrowDate;
  dueDate.value = item.dueDate;
  phone.value = item.phone || "";
  email.value = item.email || "";
  status.value = item.status;
  note.value = item.note || "";

  borrowModal.style.display = "flex"; // Hiện form lên để sửa
};

window.deleteBorrow = function (index) {
  const result = confirm("Bạn có chắc chắn muốn xóa phiếu mượn này không?");
  if (result) {
    borrows.splice(index, 1); // Xóa bỏ 1 phần tử tại vị trí chọn
    localStorage.setItem("borrows", JSON.stringify(borrows)); // Cập nhật lại kho
    renderBorrows(); // In lại bảng ngay tức khắc
  }
};

// =========================================================================
// BƯỚC 5: KIỂM TRA DỮ LIỆU (VALIDATE) & TIẾN HÀNH LƯU FORM
// =========================================================================
if (borrowForm) {
  borrowForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Chặn tải lại trang web làm mất dữ liệu JavaScript

    let isValid = true;
    clearErrors(); // Xóa lỗi cũ trước khi thẩm định lại từ đầu

    // Lấy chuỗi dữ liệu trong các ô
    const borrowIdValue = borrowId.value.trim().toUpperCase();
    const borrowerNameValue = borrowerName.value.trim();
    const bookIdValue = bookId.value.trim().toUpperCase();
    const categoryValue = category.value;
    const borrowDateValue = borrowDate.value;
    const dueDateValue = dueDate.value;
    const phoneValue = phone.value.trim();
    const emailValue = email.value.trim();
    const statusValue = status.value;
    const noteValue = note.value.trim();

    // ===== Validate Mã phiếu mượn (Định dạng PM-XXXX) =====
    const borrowIdPattern = /^PM-\d{4}$/;
    if (!borrowIdPattern.test(borrowIdValue)) {
      isValid = false;
      document.getElementById("borrowIdError").textContent =
        "Mã phiếu mượn phải đúng định dạng PM-XXXX (Ví dụ: PM-2048)";
    } else if (
      editIndex === -1 &&
      borrows.some((b) => b.borrowId === borrowIdValue)
    ) {
      // Nếu ở chế độ Thêm mới mà mã phiếu nhập trùng với người đã có trong mảng
      isValid = false;
      document.getElementById("borrowIdError").textContent =
        "Mã phiếu mượn này đã tồn tại trong hệ thống!";
    }

    // ===== Validate Họ tên người mượn =====
    const namePattern = /^[A-Za-zÀ-ỹ\s]+$/;
    if (borrowerNameValue === "") {
      isValid = false;
      document.getElementById("borrowerNameError").textContent =
        "Vui lòng nhập họ tên người mượn";
    } else if (!namePattern.test(borrowerNameValue)) {
      isValid = false;
      document.getElementById("borrowerNameError").textContent =
        "Họ tên chỉ được chứa chữ cái và khoảng trắng";
    }

    // ===== Validate Mã sách (Định dạng BKXXXXX) =====
    const bookIdPattern = /^BK\d{5}$/;
    if (!bookIdPattern.test(bookIdValue)) {
      isValid = false;
      document.getElementById("bookIdError").textContent =
        "Mã sách phải đúng định dạng BKXXXXX (Ví dụ: BK10234)";
    }

    // ===== Validate Thể loại sách =====
    if (categoryValue === "") {
      isValid = false;
      document.getElementById("categoryError").textContent =
        "Vui lòng chọn thể loại sách";
    }

    // ===== Validate Ngày mượn =====
    if (borrowDateValue === "") {
      isValid = false;
      document.getElementById("borrowDateError").textContent =
        "Vui lòng chọn ngày mượn";
    }

    // ===== Validate Hạn trả (Phải sau hoặc cùng ngày mượn) =====
    if (dueDateValue === "") {
      isValid = false;
      document.getElementById("dueDateError").textContent =
        "Vui lòng chọn hạn trả sách";
    } else if (
      borrowDateValue !== "" &&
      new Date(dueDateValue) < new Date(borrowDateValue)
    ) {
      isValid = false;
      document.getElementById("dueDateError").textContent =
        "Hạn trả không được trước ngày mượn";
    }

    // ===== Validate Số điện thoại (Đầu số VN thông dụng) =====
    const phonePattern = /^(03|05|07|08|09)\d{8}$/;
    if (!phonePattern.test(phoneValue)) {
      isValid = false;
      document.getElementById("phoneError").textContent =
        "Số điện thoại không đúng (Phải gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)";
    }

    // ===== Validate Email =====
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailValue === "") {
      isValid = false;
      document.getElementById("emailError").textContent =
        "Vui lòng nhập địa chỉ email";
    } else if (!emailPattern.test(emailValue)) {
      isValid = false;
      document.getElementById("emailError").textContent =
        "Địa chỉ email không đúng định dạng (Ví dụ: abc@library.vn)";
    }

    // ===== Validate Trạng thái =====
    if (statusValue === "") {
      isValid = false;
      document.getElementById("statusError").textContent =
        "Vui lòng chọn trạng thái phiếu mượn";
    }

    // Nếu phát hiện có ô điền sai -> Dừng ngay lệnh lưu
    if (!isValid) return;

    // Đóng gói thông tin hợp lệ thành Object phiếu mượn sách
    const borrowObj = {
      borrowId: borrowIdValue,
      borrowerName: borrowerNameValue,
      bookId: bookIdValue,
      category: categoryValue,
      borrowDate: borrowDateValue,
      dueDate: dueDateValue,
      phone: phoneValue,
      email: emailValue,
      status: statusValue,
      note: noteValue,
    };

    if (editIndex === -1) {
      // Thêm mới: Đẩy vào cuối mảng dữ liệu
      borrows.push(borrowObj);
    } else {
      // Sửa đổi: Cập nhật đè lên phần tử tại vị trí cũ
      borrows[editIndex] = borrowObj;
      editIndex = -1; // Reset trạng thái
    }

    // Đồng bộ cất dữ liệu vào kho lưu trữ cố định LocalStorage
    localStorage.setItem("borrows", JSON.stringify(borrows));

    renderBorrows(); // Vẽ lại bảng giao diện ngay lập tức
    borrowForm.reset(); // Làm sạch form
    borrowModal.style.display = "none"; // Ẩn popup modal
  });
}

// =========================================================================
// BƯỚC 6: TẢI KHỞI TẠO DỮ LIỆU BAN ĐẦU (Chạy 1 lần duy nhất khi mở trang)
// =========================================================================
function loadInitialBorrows() {
  const localData = localStorage.getItem("borrows");

  if (localData) {
    // Nếu trong tủ kho trình duyệt đã có sẵn dữ liệu từ trước -> lấy ra dùng tiếp
    borrows = JSON.parse(localData);
  } else {
    // Nếu mở trang lần đầu tiên (kho trống rỗng) -> Tạo sẵn 5 dòng dữ liệu mẫu giống hệt đề bài HTML
    borrows = [
      {
        borrowId: "PM-2048",
        borrowerName: "Nguyễn Văn An",
        bookId: "BK10234",
        category: "CNTT",
        borrowDate: "2025-05-01",
        dueDate: "2025-05-20",
        phone: "0912345678",
        email: "an@library.vn",
        status: "Đang mượn",
        note: "",
      },
      {
        borrowId: "PM-3056",
        borrowerName: "Trần Thị Bình",
        bookId: "BK54321",
        category: "Ngoại ngữ",
        borrowDate: "2025-05-10",
        dueDate: "2025-05-30",
        phone: "0987654321",
        email: "binh@library.vn",
        status: "Đã trả",
        note: "",
      },
      {
        borrowId: "PM-4123",
        borrowerName: "Lê Văn Cường",
        bookId: "BK67890",
        category: "Kinh tế",
        borrowDate: "2025-05-15",
        dueDate: "2025-06-05",
        phone: "0901234567",
        email: "cuong@library.vn",
        status: "Đang mượn",
        note: "",
      },
      {
        borrowId: "PM-5678",
        borrowerName: "Phạm Thị Dung",
        bookId: "BK11111",
        category: "Kỹ năng",
        borrowDate: "2025-05-20",
        dueDate: "2025-06-10",
        phone: "0934567890",
        email: "dung@library.vn",
        status: "Đã trả",
        note: "",
      },
      {
        borrowId: "PM-6789",
        borrowerName: "Hoàng Minh Đức",
        bookId: "BK22222",
        category: "CNTT",
        borrowDate: "2025-05-25",
        dueDate: "2025-06-15",
        phone: "0976543210",
        email: "duc@library.vn",
        status: "Đang mượn",
        note: "",
      },
    ];
    // Cất luôn 5 người mẫu này vào kho lưu trữ
    localStorage.setItem("borrows", JSON.stringify(borrows));
  }

  // Chạy vẽ dữ liệu lên màn hình
  renderBorrows();
}

// Chạy hàm nạp dữ liệu hệ thống
loadInitialBorrows();

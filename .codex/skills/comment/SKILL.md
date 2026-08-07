---
name: code-commenting
description: Use this skill whenever writing, reviewing, or adding comments to code (any language). Ensures comments explain WHY, not WHAT, avoids redundant/obvious comments, and keeps code clean and maintainable. Trigger when user asks to "comment code", "add docstrings", "explain code with comments", or when generating new code that will include comments.
---

# Code Commenting Skill

## Nguyên tắc cốt lõi
Giải thích **TẠI SAO**, không giải thích **CÁI GÌ**. Nếu code đã tự nói rõ nó làm gì (nhờ tên biến/hàm tốt), không cần comment nhắc lại.

## Khi nào NÊN comment
- Logic phức tạp, thuật toán không hiển nhiên
- Công thức/đoạn code "ma thuật" — nên dẫn nguồn nếu copy từ nơi khác
- Giả định (assumption) hoặc precondition quan trọng mà code không thể hiện rõ
- Quyết định kỹ thuật khó hiểu nếu chỉ đọc code (vì sao chọn cách này thay vì cách hiển nhiên hơn)
- Workaround cho bug/edge case lạ — nếu không giải thích, người sau dễ "dọn dẹp" nhầm và làm hỏng
- TODO/FIXME đánh dấu phần chưa hoàn thiện
- Docstring/JSDoc cho public function/API: mô tả input, output, side effect, exception

## Khi nào KHÔNG nên comment
- Code đã tự giải thích qua tên biến/hàm rõ ràng
- Comment lặp lại y nguyên logic code (redundant)
- Comment quá hiển nhiên (ví dụ: `i++ // tăng i lên 1`)
- Không comment từng dòng — chỉ những chỗ thật sự cần thiết

## Ví dụ

```js
// Tệ — chỉ lặp lại code
counter += 1  // tăng counter lên 1

// Tốt — giải thích lý do
counter += 1  // bù index 0-based sang 1-based khi hiển thị cho user
```

```python
# Tệ
# Khởi tạo biến total = 0
total = 0

# Tốt (không cần comment gì cả, code đã rõ)
total = 0
```

```js
// Tốt — giải thích workaround khó hiểu
if (value == null || value.equals(null)) {
  // API trả về Boolean nullable dạng String "null" thay vì null thật
  // xem: https://issue-tracker/xyz-123
  return null;
}
```

## Rủi ro của over-comment
- Comment dễ lỗi thời (outdated) khi code thay đổi → 2 nguồn thông tin mâu thuẫn, gây nhầm lẫn. Comment sai còn tệ hơn không có comment.
- Làm code rối mắt, khó đọc
- Tăng gánh nặng bảo trì (sửa code phải nhớ sửa cả comment)

## Áp dụng riêng khi generate code bằng AI
- Mặc định AI có xu hướng comment mọi dòng — chủ động cắt bớt, chỉ giữ comment tạo giá trị thật
- Không thêm comment kiểu: `// import thư viện cần thiết`, `// khởi tạo biến`, `// gọi hàm x`
- Ưu tiên docstring/JSDoc ở đầu function thay vì rải comment từng dòng bên trong
- Function đơn giản, tên rõ ràng → không cần comment gì cả
- Giữ comment ngắn gọn, súc tích, đúng văn phong code base hiện có (nếu biết)

## Checklist trước khi thêm comment
1. Comment này có lặp lại điều code đã nói không? → Nếu có, xóa.
2. Comment này giải thích "why" hay chỉ "what"? → Ưu tiên "why".
3. Có cần comment này để tránh người khác hiểu sai/sửa nhầm không? → Nếu không, cân nhắc bỏ.
4. Docstring cho function public đã đủ mô tả input/output/exception chưa?
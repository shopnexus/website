# Bong bóng chat trên trang sản phẩm + bố cục lại trang chi tiết

Ngày: 2026-08-22

## Vấn đề

Hai việc, cùng chạm vào `/product/[id]`.

**1. Muốn hỏi người bán thì phải rời trang.** `StartChatButton` gọi `POST /conversations`
rồi `router.push("/inbox?c=…&listing_id=…")`. Người mua đang cân nhắc bị đẩy khỏi tin
đăng — quay lại thì mất phân loại đã chọn, mất vị trí cuộn. Trang rao vặt nào cũng giải
bằng một bong bóng chat neo tại chỗ (nhattot.com là tham chiếu của yêu cầu này).

**2. Trang chi tiết quá to và trống.** Đo trên `lst_1sd3ezs2gd94c` ở 1440px:

- Gallery `aspect-[4/5]` rộng 520px → cao 650px. Chiếm gần trọn màn hình đầu.
- Cột phải rộng ~640px nhưng nội dung ngắn: hai nút mua dài 250px mỗi cái, nhiều khoảng trống.
- Băng `SellerPanel` full-width gần như rỗng với người bán mới ("Người bán mới", tháng tham gia).
- Bảng thông số kéo ngang 1100px, cặp nhãn/giá trị trôi xa nhau.
- Mỗi review là một card viền dày; toàn trang cao 6443px.
- Mobile 390px: breadcrumb xuống 3 dòng, tiêu đề bị đẩy khỏi màn hình đầu.

## Điều đã có sẵn (không dựng lại)

- `components/chat/ThreadView` — thread hoàn chỉnh: phân trang lịch sử, outbox gửi lại,
  trả lời/trích dẫn, sửa/thu hồi, đính kèm, biên nhận đã xem, kéo-thả tệp.
  Nhận prop `refs` và áp cho **mọi** tin nhắn gửi đi.
- `SendMessageRequest.refs` trong OpenAPI — server đã nhận và kiểm quyền truy cập từng ref.
- `POST /conversations` idempotent theo cặp tài khoản (`StartChatButton` đang dựa vào điều này).
- `/inbox` đọc `lastReferencedListingId(messages)` → tự hiện `ListingBanner` + rail thông tin.
- `RealtimeProvider` đẩy `chat.message_created`, `useChatUnreadCount`, `useConversation`.

**Kết luận: không cần sửa backend.** Đường dây tham chiếu sản phẩm đã thông từ đầu tới cuối;
việc còn lại là nối một giao diện mới vào nó.

## Phần A — Bong bóng chat

### Phạm vi

Chỉ `/product/[id]`. Không dựng messenger toàn site: `/inbox` đã là màn hình đó, và một
dock toàn site sẽ là bản sao thứ hai của cùng một danh sách hội thoại.

Không hiện với tin đăng của chính mình. Chưa đăng nhập thì panel mở ra được nhưng chỉ
chứa lời mời đăng nhập kèm `callbackUrl` về đúng trang này.

### Hình

```
thu gọn:                     mở:
                             ┌──────────────────────────────────────┐
                             │ [avatar] Chi Official      ↗   ✕     │
                             ├──────────────────────────────────────┤
                             │ [ảnh] Sách The Jungle Book           │  ← reference, ghim
                             │       58.500 đ · Còn 5               │
   ┌───────────────────┐     ├──────────────────────────────────────┤
   │ 💬 Chat với người │     │            <ThreadView>              │
   │    bán        (2) │     │                                      │
   └───────────────────┘     ├──────────────────────────────────────┤
                             │ [Còn hàng không?] [Thương lượng?]    │  ← chỉ khi thread trống
                             ├──────────────────────────────────────┤
                             │ 📎  Viết tin nhắn…              ➤    │
                             └──────────────────────────────────────┘
```

- Desktop: `fixed bottom-6 right-6`, panel `w-[380px] h-[min(560px,70vh)]`.
- Mobile: sheet `inset-x-0 bottom-0 h-[85vh]`, bo góc trên.
- Badge trên nút thu gọn = `unread` của đúng hội thoại đó, không phải tổng toàn hệ thống.

### Tạo hội thoại trễ

1. Mở panel → quét `useConversations()` tìm `counterparty.id === sellerId`.
   Có → `conversationId` sẵn, render `ThreadView` với toàn bộ lịch sử.
2. Không có → trạng thái "intro": chip gợi ý + ô soạn riêng, chưa gọi API nào.
3. Bấm gửi lần đầu → `POST /conversations` → `POST /conversations/{id}/messages`
   kèm `refs` → chuyển sang `ThreadView`.

Bước 3 mới là thứ tạo thread. Tạo lúc mở panel thì mỗi người tò mò bấm thử là người bán
có thêm một hội thoại rỗng trong hộp thư.

Chip **điền vào ô soạn** rồi focus, không tự gửi. Người dùng sửa được trước khi gửi —
"Bạn ship về Ninh Bình được không?" cần sửa tên tỉnh.

Chip mặc định (bỏ chip không áp dụng được):

- "Sản phẩm còn không?"
- "Giá này thương lượng được không?" — chỉ khi `price_mode === "negotiable"`
- "Bạn ship về {tỉnh của người mua hoặc tỉnh của tin đăng} được không?"
- "Mình xem hàng trực tiếp được không?"

### Tham chiếu sản phẩm

- `refs={{ listing_id: product.id }}` truyền vào `ThreadView` → mọi tin gửi từ dock đều mang nó.
- Người bán mở `/inbox` thấy `ListingBanner` + rail như hiện tại. Không sửa gì ở inbox.
- **Bổ sung:** trong thread, khi `refs.listing_id` của một tin khác với tin trước nó, chèn
  một dải ngăn `Hỏi về: {ảnh nhỏ} {tên sản phẩm}`.
  Lý do: chat có **một** thread cho mỗi cặp tài khoản, dùng lại cho mọi sản phẩm. Banner
  chỉ hiện tin đăng được nhắc **gần nhất**, nên một người mua hỏi ba món trong cùng thread
  sẽ khiến người bán trả lời nhầm món. Dải ngăn đặt câu hỏi vào đúng ngữ cảnh của nó, ngay
  tại chỗ nó được đọc.
  Tên sản phẩm lấy qua `useListingMap(ids)` — một lượt đọc gộp cho cả thread, đúng cách
  inbox đang phân giải tin đăng cho danh sách hội thoại.

### Va chạm với thanh mua dưới màn hình

`ProductBottomBar` là `fixed bottom-0 z-40`. Sau phần B, thanh này chỉ còn trên mobile
(`lg:hidden`), vì desktop đã có card mua sticky. Trên mobile, nút chat nâng lên
`bottom-[76px]` khi thanh đang hiện.

`useScrolledPast` hiện nằm trong `ProductBottomBar`. Tách ra `_hooks/useScrolledPast.ts`
để cả thanh và nút chat đọc cùng một câu trả lời thay vì mỗi bên tự quan sát.

### File

| File | Việc |
|---|---|
| `_components/ProductChatDock.tsx` | nút thu gọn + panel, vị trí, trạng thái mở/đóng |
| `_components/ChatDockIntro.tsx` | chip gợi ý + ô soạn trước khi có thread |
| `_components/ChatDockListingRef.tsx` | thẻ sản phẩm ghim trong header panel |
| `_hooks/useProductChat.ts` | tìm thread sẵn có, tạo trễ, gửi tin đầu tiên |
| `_lib/chat-prompts.ts` | dựng danh sách chip từ tin đăng |
| `components/chat/ListingRefDivider.tsx` | dải "Hỏi về: …" trong thread |
| `components/chat/chat.logic.ts` | `listingRefChanges(messages)` — thuần, có thể kiểm thử |
| `hooks/api/useChat.ts` | `useStartConversationWithMessage()` |

## Phần B — Bố cục lại trang chi tiết

### Desktop ≥1280px — ba cột trong `max-w-[1240px]`

```
┌────────────────┬──────────────────────────┬─────────────────┐
│ ▪ rail 56px    │ H1 20px                  │ 58.500 đ  (30px)│ ← sticky
│ ▪  ┌────────┐  │ ★4,4 · 25 đánh giá ·     │ Còn 5 · đã bán 5│   top-[84px]
│ ▪  │ ảnh    │  │ đã bán 102               │ Số lượng [− 1 +]│
│ ▪  │ 1:1    │  │                          │ [Thêm vào giỏ ] │
│    │contain │  │ Phân loại: [A] [B] [C]   │ [Mua ngay     ] │
│    └────────┘  │                          │ 🛡 giữ tiền…    │
│                │ Tình trạng   Nơi bán     ├─────────────────┤
│                │ Đăng tin     Bảo hành    │ [C] Chi Official│
│                │                          │ ✓ · ★4,4 · 12 đơn│
│                │ ⚑ Báo cáo tin đăng       │ [Chat][Theo dõi]│
│                │                          │ [Xem gian hàng ]│
└────────────────┴──────────────────────────┴─────────────────┘
      420px              flex-1, min-w-0           336px
```

- Ảnh chính `aspect-square`, `object-contain` trên `bg-surface-container-low`.
  `object-cover` đang cắt mép ảnh hàng cũ — mà mép ảnh chính là chỗ nhìn ra vết xước.
- Rail thumbnail **dọc** bên trái: xoá dải ngang chiếm thêm 68px chiều cao dưới ảnh.
- Băng `SellerPanel` full-width bị xoá, gộp thành card gọn ở cột 3. Các số của nó
  (sao/đơn/follower/tham gia/đã xác minh) thành một hàng chỉ số hai dòng.

### Điểm gãy

- `1024–1279`: hai cột — gallery, rồi cột phải xếp chồng (card mua trước, thông tin sau).
- `<1024`: một cột. CTA nằm ở `ProductBottomBar`.

### Phần dưới

- Mô tả: `max-w-[72ch]`, gập còn ~10 dòng, nút "Xem thêm".
- Thông số: lưới hai cột cặp nhãn/giá trị, `max-w-[900px]`.
- Đánh giá: danh sách có đường kẻ ngăn thay cho card viền dày; avatar 32px; mặc định 5 mục.
- Hai rail sản phẩm: giữ nguyên.

### Mobile

- Breadcrumb một dòng, cuộn ngang, `hide-scrollbar`.
- Gallery `aspect-square`, vuốt ngang bằng embla (đã có sẵn), chấm chỉ vị trí + đếm `n/N`.
- `ProductBottomBar` giữ nguyên, thêm `lg:hidden`.

### Mật độ

Giá 36px → 30px. H1 `headline-md` → 20px/28. Nút trong card mua `h-12` → `h-10`.
Padding card `p-6` → `p-4`.

## Phần C — Type scale toàn cục

Bốn dòng trong `globals.css`. Scale hiện tại không phải nguyên nhân chính của "to" —
`body-md` 16/26 và `label-md` 14/20 đều hợp lý — nên chỉ hạ phần đỉnh:

| class | cũ | mới | số nơi dùng |
|---|---|---|---|
| `display-lg` | 40/48 | 36/44 | 11 |
| `display-lg-mobile` | 32/40 | 28/36 | 1 |
| `headline-md` | 24/32 | 22/30 | 21 |
| `body-md` | 16/26 | 16/24 | 81 |

Không đụng `body-sm` (278 nơi), `label-md` (229), `label-sm` (193): rủi ro hồi quy trên
40+ trang không tương xứng với vài pixel.

Kiểm chứng: chụp lại trang chủ và trang tìm kiếm sau khi đổi.

## Xử lý lỗi

- `POST /conversations` hỏng → toast "Không mở được cuộc trò chuyện", ô soạn giữ nguyên
  chữ đã gõ. Không mất tin nhắn.
- Gửi tin hỏng → `useMessageOutbox` của `ThreadView` đã lo: bong bóng lỗi + nút gửi lại.
- Ảnh tin đăng hỏng → ô xám, không vỡ bố cục.
- Người bán xoá tin trong lúc panel đang mở → thẻ ghim vẫn hiện tên đã đọc được;
  chat không phụ thuộc vào tin đăng còn sống hay không.

## Kiểm thử

- `pnpm typecheck`, `pnpm lint`.
- Chụp màn hình 1440 / 1280 / 1024 / 390 trên `/product/lst_1sd3ezs2gd94c`, so chiều cao
  trang trước/sau.
- Chụp trang chủ + tìm kiếm để xác nhận thay đổi type scale không vỡ.
- Kiểm bằng tay: mở dock khi chưa đăng nhập; mở dock trên tin của chính mình (không hiện);
  gửi tin đầu tiên tạo thread; gửi tin thứ hai không tạo thread mới; mở `/inbox` bằng tài
  khoản người bán và xác nhận banner tin đăng hiện đúng.

## Ngoài phạm vi

- Messenger toàn site.
- Thay đổi backend.
- Server-side render lại trang sản phẩm cho SEO (đã ghi nhận trong `ProductPage`).
- Chip gợi ý sinh theo danh mục.

import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_CURRENT_PAGE } from '*/utilities/constants'

// https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#pagination-example
export const pagingSkipValue = (currentPage = DEFAULT_CURRENT_PAGE, itemsPerPage = DEFAULT_ITEMS_PER_PAGE) => {
  // Vẫn phải kiểm tra giá trị ở đây vì có thể client sẽ gửi lên số âm chẳng hạn
  if (!currentPage || !itemsPerPage) return 0
  if (currentPage <= 0 || itemsPerPage <= 0) return 0
  /**
   * Ví dụ mỗi page hiển thị 12 sản phẩm
   * Case 01: User đứng ở page 1 thì sẽ lấy 1 - 1 = 0 sau đó nhân với 12 thì cũng = 0, lúc này giá trị skip là 0, nghĩa là không skip bản ghi
   * Case 02: User đứng ở page 5 thì sẽ lấy 5 - 1 = 4 sau đó nhân với 12 thì = 48, lúc này giá trị skip là 48, nghĩa là bỏ qua 48 bản ghi của 4 page trước đó
   * ... Tương tự với mọi page khác
   */
  return (currentPage - 1) * itemsPerPage
}
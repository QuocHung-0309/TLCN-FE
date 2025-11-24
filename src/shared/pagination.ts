export function getPaginationRange(
    currentPage: number,
    totalPages: number
  ): (number | string)[] {
    const pages: (number | string)[] = [];
  
    if (totalPages <= 0) return pages;  
   
    currentPage = Math.max(1, Math.min(currentPage, totalPages));  
   
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }  
   
    pages.push(1);  
    
    if (currentPage > 2) pages.push("...");  
   
    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(currentPage);
    }  
    
    if (currentPage < totalPages - 1) pages.push("...");  
   
    pages.push(totalPages);
  
    return pages;
  }
  
import { useEffect, useState } from "react";
import {
  getAllCategories,
  createCategory,
  Category,
} from "../../../api/categoriesApi";

const CategoriesPage = () => {
  // Khai báo state đúng kiểu
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(console.error);
  }, []);

  const handleAdd = async () => {
    const newCat = await createCategory({ name: "New Category" });
    // prev bây giờ là Category[] thay vì never[]
    setCategories((prev) => [...prev, newCat]);
  };

  return (
    <div>
      <h1>Categories</h1>
      <button onClick={handleAdd}>Thêm Category</button>
      <ul>
        {categories.map((c) => (
          <li key={c.category_ID}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;

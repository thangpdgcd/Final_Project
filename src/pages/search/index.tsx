import React, { useState } from "react";
import { Input, List } from "antd";
import searchcon from "../../assets/img/search.png"; // thay đường dẫn cho đúng
import "./index.scss";

const { Search } = Input;

const SearchComponent: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const fakeResults = [value, value + " 1", value + " 2"];
    setResults(fakeResults);
  };

  return (
    <div className='search-container'>
      <Search
        placeholder='Nhập để tìm...'
        allowClear
        size='large'
        enterButton={
          <img className='iconsearch' src={searchcon} alt='search icon' />
        }
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {results.length > 0 && (
        <List
          className='search-results'
          bordered={false}
          dataSource={results}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      )}
    </div>
  );
};

export default SearchComponent;

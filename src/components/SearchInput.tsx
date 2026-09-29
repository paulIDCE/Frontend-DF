import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { color } from "@/design/tokens";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const SearchInput = ({ value, onChange, placeholder = "Buscar...", style }: SearchInputProps) => {
  return (
    <Input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      prefix={<SearchOutlined style={{ color: color.tinta.deshabilitada }} />}
      style={{ width: 280, ...style }}
    />
  );
};

export default SearchInput;

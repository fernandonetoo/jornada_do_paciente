import { Search } from "lucide-react";

type SearchCardProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SearchCard({
  label,
  placeholder,
  value,
  onChange,
}: SearchCardProps) {
  return (
    <div className="form-card">
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="search-card-input">
          <Search size={17} aria-hidden="true" />
          <input
            className="form-input"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

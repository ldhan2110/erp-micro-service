import React from "react";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { useAppTranslate } from "@/hooks";
import type { TLang } from "@/types";
import appStore from "@/stores/AppStore";

const { Option } = Select;

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "kr", label: "한국어", flag: "🇰🇷" },
  { code: "vn", label: "Tiếng Việt", flag: "🇻🇳" },
];

const LanguageSelector: React.FC = observer(() => {
  const { changeLanguage } = useAppTranslate();
  const { lang } = appStore.state;

  const handleChange = (value: string) => {
    appStore.setLang(value as TLang);
    changeLanguage(value);
  };

  const renderOption = (lang: (typeof LANGUAGES)[0]) => (
    <Option key={lang.code} value={lang.code}>
      <span role="img" aria-label={lang.label} style={{ marginRight: 8 }}>
        {lang.flag}
      </span>
      {lang.label}
    </Option>
  );

  return (
    <Select value={lang} onChange={handleChange} style={{ width: 110 }}>
      {LANGUAGES.map(renderOption)}
    </Select>
  );
});

export default LanguageSelector;

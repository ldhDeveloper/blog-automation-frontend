// brand-icons.tsx
import type { LucideProps } from "lucide-react";
import * as React from "react";

type BrandIconData = {
  /** SVG path d attribute (SimpleIcons의 .path) */
  path: string;
  /** 기본 viewBox; SimpleIcons는 24x24 기준이라 보통 "0 0 24 24" */
  viewBox?: string;
  /** 접근성 title 텍스트(없으면 aria-hidden 처리) */
  title?: string;
};

/**
 * SimpleIcons 아이콘을 Lucide 스타일(동일한 props)로 감싸는 팩토리
 * - fill 아이콘이므로 stroke 관련 옵션은 시각적으로 영향이 없습니다.
 */
export function createBrandIcon(name: string, data: BrandIconData) {
  const {
    path,
    viewBox = "0 0 24 24",
    title: defaultTitle,
  } = data;

  const BrandIcon = React.forwardRef<SVGSVGElement, Omit<LucideProps, "ref">>(
    (
      {
        size = 24,
        color = "currentColor",
        className,
        // Lucide 호환 props (솔리드라 시각적 영향은 없음)
        strokeWidth,           // eslint-disable-line @typescript-eslint/no-unused-vars
        absoluteStrokeWidth,   // eslint-disable-line @typescript-eslint/no-unused-vars
        // 접근성
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-hidden": ariaHidden,
        // 나머지 SVG 속성
        ...rest
      },
      ref
    ) => {
      const hasAccessibleName = Boolean(ariaLabel || defaultTitle);
      const a11yProps: React.SVGProps<SVGSVGElement> = hasAccessibleName
        ? { role: "img", "aria-hidden": undefined }
        : { "aria-hidden": ariaHidden ?? true };

      return (
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={viewBox}
          // Lucide는 기본 stroke 아이콘이지만, 브랜드 아이콘은 보통 fill이 맞습니다.
          fill={color}
          stroke="none"
          className={className}
          focusable="false"
          {...a11yProps}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...rest}
        >
          {/* 접근성 제목(선택) */}
          {defaultTitle && !ariaLabel && !ariaLabelledBy ? (
            <title>{defaultTitle}</title>
          ) : null}
          <path d={path} />
        </svg>
      );
    }
  );

  BrandIcon.displayName = name;
  return BrandIcon;
}
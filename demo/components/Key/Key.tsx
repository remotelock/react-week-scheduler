import React from 'react';
import defaultClasses from './Key.module.scss';

export function Key({
  children,
  classes,
}: {
  children: string;
  classes?: Partial<typeof defaultClasses>;
}) {
  const classNames = { ...defaultClasses, ...classes };
  return <span className={classNames.key}>{children}</span>;
}

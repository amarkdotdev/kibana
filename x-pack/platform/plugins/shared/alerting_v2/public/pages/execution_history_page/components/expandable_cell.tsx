/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCopy,
  EuiHorizontalRule,
  EuiPopover,
  EuiToolTip,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';

const cellWrapperCss = css`
  position: relative;
  min-width: 0;

  .expandBtn {
    position: absolute;
    left: -28px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 150ms;
  }

  &:hover .expandBtn,
  &:focus-within .expandBtn {
    opacity: 1;
  }
`;

const popoverContentCss = css`
  max-height: 300px;
  overflow-y: auto;
  word-break: break-word;
  white-space: pre-wrap;
`;

const popoverPanelStyle = { maxWidth: 400 };
const clickableTextStyle = { minWidth: 0 };
const truncatedTextStyle: React.CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

interface ExpandableCellProps {
  text: string;
  onClick?: () => void;
  'data-test-subj'?: string;
}

export const ExpandableCell = ({
  text,
  onClick,
  'data-test-subj': dataTestSubj,
}: ExpandableCellProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const expandLabel = i18n.translate('xpack.alertingV2.executionHistory.expandableCell.expand', {
    defaultMessage: 'Expand',
  });

  return (
    <div css={cellWrapperCss}>
      <EuiPopover
        className="expandBtn"
        aria-label={expandLabel}
        button={
          <EuiToolTip content={expandLabel} disableScreenReaderOutput>
            <EuiButtonIcon
              iconType="expand"
              iconSize="s"
              color="text"
              aria-label={expandLabel}
              data-test-subj={dataTestSubj ? `${dataTestSubj}-expand` : undefined}
              onClick={() => setIsOpen(!isOpen)}
            />
          </EuiToolTip>
        }
        isOpen={isOpen}
        closePopover={() => setIsOpen(false)}
        anchorPosition="downLeft"
        panelPaddingSize="m"
        panelStyle={popoverPanelStyle}
      >
        <span css={popoverContentCss}>{text}</span>
        <EuiHorizontalRule margin="s" />
        <EuiCopy textToCopy={text}>
          {(copy) => (
            <EuiButtonEmpty size="xs" iconType="copyClipboard" onClick={copy} flush="left">
              {i18n.translate('xpack.alertingV2.executionHistory.expandableCell.copyValue', {
                defaultMessage: 'Copy value',
              })}
            </EuiButtonEmpty>
          )}
        </EuiCopy>
      </EuiPopover>
      {onClick ? (
        <EuiButtonEmpty
          size="xs"
          flush="left"
          onClick={onClick}
          data-test-subj={dataTestSubj}
          className="eui-textTruncate"
          style={clickableTextStyle}
        >
          {text}
        </EuiButtonEmpty>
      ) : (
        <span className="eui-textTruncate" style={truncatedTextStyle}>
          {text}
        </span>
      )}
    </div>
  );
};

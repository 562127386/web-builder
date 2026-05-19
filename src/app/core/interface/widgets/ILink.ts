import { MatDialogConfig } from '@angular/material/dialog';
import { Params } from '@angular/router';
import { IIcon } from './IIcon';

export interface ILink {
  type?: 'link';
  href?: string;
  classes?: any;
  target?: string;
  label: any;
  icon?: IIcon;
  popup?: any;
  queryParams?: Params | null;
  fragment?: string;
  rel?: string;
  params?: any;
  color?: string;
  previewPdf?: boolean;
  tooltip?: {
    message: string;
    position?: 'above' | 'below' | 'left' | 'right' | 'before' | 'after';
  };
  dialog?: {
    params: MatDialogConfig;
    data: any[];
    afterClosed?: {
      success: {
        label: string;
      };
      emit: boolean;
    };
  };
}

import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  signal,
  output,
  inject
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import type { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormChangeService } from '@core/service/form-change.service';
interface IFormly {
  fields?: FormlyFieldConfig[];
}

@Component({
  selector: 'app-formly',
  templateUrl: './formly.component.html',
  styleUrls: ['./formly.component.scss'],
  standalone: false,
})
export class FormlyComponent implements OnInit, AfterViewInit {
  @Input() content: IFormly;
  @Input() fields: FormlyFieldConfig[];
  @Input() options: FormlyFormOptions = {};
  @Input() form: UntypedFormGroup = new UntypedFormGroup({});
  @Input() model: any = {};
  @Input() classes: string | object;

  readonly modelChange = output<any>();

  fieldsConfig = signal<FormlyFieldConfig[]>([]);

  private formChangeService = inject<FormChangeService>(FormChangeService);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    let config: FormlyFieldConfig[] = [];
    const fields = this.content?.fields;
    config = fields ?? this.fields;
    this.fieldsConfig.set(this.safeClone(config));
  }

  private safeClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.safeClone(item));
    }
    if (obj.constructor && obj.constructor.name !== 'Object') {
      return obj;
    }
    const clone: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = this.safeClone(obj[key]);
      }
    }
    return clone;
  }

  onModelChange(event: Record<string, any>): void {
    const componentId = this.fieldsConfig()?.[0]?.templateOptions?.componentId;
    if (componentId) {
      this.formChangeService.onFormChange(componentId, event);
    }
    this.modelChange.emit(event);
  }
}

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { renderAsync } from "docx-preview";
import {
  LibraryService,
  checkEmpty,
  checkContainsSpecialCharacters,
} from "library";
import { HttpService } from "../../../core/http";

@Component({
  selector: "cert-preview",
  templateUrl: "./preview.component.html",
  host: {
    "[class.cert-preview]": "true",
  },
})
export class CertPreviewComponent implements OnChanges, OnInit {
  _visible = false;
  errorInfo = null;
  loading = false;
  remoteResp = null;

  @Input()
  previewData: string | ArrayBuffer | Blob = null;

  @Input()
  fileName: string;

  // 预览的文件存放的地址，远程服务器(详情预览)或本地文件(上传预览)
  // @Input()
  // fileDeposit: "remote" | "local" = "local"

  // 请求远程文件的url,用于下载文件
  @Input()
  remoteUrl: string = null;

  @Input()
  localFile: File = null;

  @Input()
  title = "文件预览";

  @Output()
  visibleChange = new EventEmitter<boolean>();

  @Output()
  onError = new EventEmitter<any>();

  @Input()
  set visible(val: boolean) {
    this._visible = val;
    if (val) {
      this.loading = true;
      this.errorInfo = null;
      this.remoteResp = null;
    }
  }

  container = null;

  constructor(public http: HttpService, public library: LibraryService) {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}

  showDialog() {
    this.preview();
  }
  hideDialog() {
    this.visibleChange.emit(false);
    if (!this.container) {
      this.container = document.getElementById("cert-preview-container");
    }
    this.container.innerHTML = "";
  }

  preview() {
    setTimeout(async () => {
      try {
        debugger;
        if (!this.container) {
          this.container = document.getElementById("cert-preview-container");
        }
        if (this.fileName.lastIndexOf(".") <= -1) {
          this.library.promptMessage(
            "没有识别到文件扩展名，请切换文件再行尝试",
            "error"
          );
          return;
        }
        if (this.remoteUrl) {
          this.remoteResp = await this.http.download(
            this.remoteUrl,
            {},
            { direct: true, fileName: this.fileName }
          );
        }
        const fileExtension = this.fileName
          .slice(this.fileName.lastIndexOf(".") + 1)
          .toLocaleLowerCase();
        if (/(doc|docx|rtf|docm|dotx|dotm|dot)/.test(fileExtension)) {
          this.previewDocx();
        } else if (/(txt)/.test(fileExtension)) {
          this.previewTxt();
        } else if (
          /(bmp|ico|jpeg|jpg|gif|png|svg|tif|tiff|webp)/.test(fileExtension)
        ) {
          this.previewImage();
        } else if (/(pdf)/.test(fileExtension)) {
          this.previewPdf();
        }
      } catch (error) {
      } finally {
        this.loading = false;
      }
    }, 0);
  }

  previewDocx() {
    setTimeout(() => {
      if (this.remoteResp) {
        const docxFile = new Blob([this.remoteResp.body], {
          type: "application/octet-stream",
        });
        this.renderWord(docxFile);
      } else {
        let reader = new FileReader();
        reader.readAsArrayBuffer(this.localFile);
        reader.onload = (loadEvent) => {
          let arrayBuffer = loadEvent.target.result;
          const blob = new Blob([arrayBuffer], {
            type: "application/octet-stream",
          });
          this.renderWord(blob);
        };
      }
    }, 300);
  }

  renderWord(previewData) {
    renderAsync(previewData, this.container, null, {
      className: "cert-docx",
    })
      .then((res) => {
        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
        this.errorInfo = "预览失败";
        this.onError.emit(this.errorInfo);
      });
  }

  previewTxt() {
    setTimeout(() => {
      if (this.remoteResp) {
        const docxFile = new Blob([this.remoteResp.body], {
          type: "application/octet-stream",
        });
        this.renderTxt(docxFile);
      } else {
        let reader = new FileReader();
        reader.readAsArrayBuffer(this.localFile);
        reader.onload = (loadEvent) => {
          let arrayBuffer = loadEvent.target.result;
          const blob = new Blob([arrayBuffer], {
            type: "application/octet-stream",
          });
          this.renderTxt(blob);
        };
      }
    }, 300);
  }

  renderTxt(previewData) {
    const reader = new FileReader();
    reader.readAsText(previewData, "utf-8");
    reader.onload = () => {
      console.log(reader.result);
      let pre: any = document.createElement("pre");
      pre.append(reader.result as string);
      pre.style =
        "background-color: #000000; color: #ffffff; height: 100%; padding: 20px;overflow:auto;";
      this.container.append(pre);
    };
  }

  previewImage() {
    setTimeout(() => {
      if (this.remoteResp) {
        const docxFile = new Blob([this.remoteResp.body], {
          type: "application/octet-stream",
        });
        this.renderImage(docxFile);
      } else {
        let reader = new FileReader();
        reader.readAsArrayBuffer(this.localFile);
        reader.onload = (loadEvent) => {
          let arrayBuffer = loadEvent.target.result;
          const blob = new Blob([arrayBuffer], {
            type: "application/octet-stream",
          });
          this.renderImage(blob);
        };
      }
    }, 300);
  }

  renderImage(previewData) {
    const url = window.URL.createObjectURL(previewData);
    const img = `<img src="${url}" />`;
    this.container.innerHTML = img;
  }

  previewPdf() {
    setTimeout(() => {
      debugger;
      if (this.remoteResp) {
        const docxFile = new Blob([this.remoteResp.body], {
          type: "application/pdf",
        });
        this.renderPdf(docxFile);
      } else {
        let reader = new FileReader();
        reader.readAsArrayBuffer(this.localFile);
        reader.onload = (loadEvent) => {
          let arrayBuffer = loadEvent.target.result;
          const blob = new Blob([arrayBuffer], { type: "application/pdf" });
          this.renderPdf(blob);
        };
      }
    }, 300);
  }

  renderPdf(previewData) {
    debugger;
    const url = window.URL.createObjectURL(previewData);
    //const url = "blob:http://10.7.198.110:30082/f7475990-2b71-421b-a813-c8f291de9478"
    const object = `<object data="${url}" type="application/pdf" style="height: 100%; width: 100%" class="pdf-object"></object>`;
    this.container.innerHTML = object;
  }
}

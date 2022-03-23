import { AfterViewInit, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  public items$ = new BehaviorSubject<number[]>([0, 1, 2]);

  private itemElements = [];
  private startIndex: number;
  private endIndex: number;
  private startElement: number;

  ngAfterViewInit(): void {
    this.items$.subscribe((items) => {
      this.itemElements = [];
      if (items?.length) {
        items.forEach((item, index) => {
          const element = document.getElementsByClassName(`item-${index}`)[0];
          this.itemElements.push(element);
        });
        this.itemElements = this.itemElements.map((el: HTMLElement, index) => {
          try {
            const data = el.getClientRects();
            return {
              centerX: data.item(0).left + 50,
              centerY: data.item(0).top + 50,
              index,
            };
          } catch (e) {
            return el;
          }
        });
      }
    });
  }

  public addItem(): void {
    const newItem = this.items$.getValue().length;
    this.items$.next([...this.items$.getValue(), newItem]);
  }

  public removeItem(): void {
    const items = this.items$.getValue();
    items.pop();
    this.items$.next(items);
  }

  public onDragStart(event: DragEvent): void {
    const itemElement = this.getItemElement(event);
    if (!itemElement) return;
    this.startIndex = itemElement.index || 0;
    this.startElement = this.items$.getValue()[this.startIndex];
  }

  public onDragOver(event: DragEvent): void {
    const itemElement = this.getItemElement(event);
    if (!itemElement) return;

    if (this.items$.getValue().find((item) => item === -1)) {
      this.items$.next(this.items$.getValue().filter((item) => item !== -1));
    }

    this.endIndex = itemElement.index || 0;

    const emptyBlock = -1;
    let newItems = this.items$.getValue();
    newItems.splice(this.endIndex, 0, ...[emptyBlock]);
    this.items$.next(newItems);
  }

  public onDrop(event: DragEvent): void {
    let newItems = this.items$.getValue();
    const itemElement = this.getItemElement(event);
    if (!itemElement) {
      newItems = newItems.filter((item) => item >= 0);
      this.items$.next(newItems);
      return;
    }
    this.endIndex = itemElement.index || 0;
    newItems = newItems.map((item) => {
      if (item === -1) {
        item = this.startElement;
        return item;
      }
      return item;
    });
    newItems = newItems.filter(
      (item, index) =>
        JSON.stringify(item) !== JSON.stringify(this.startElement) ||
        this.endIndex === index
    );
    this.items$.next(newItems);
  }

  private getItemElement(event: DragEvent): any {
    const itemElement = this.itemElements.find((el: any) => {
      const elementX = Math.abs(el?.centerX - event.clientX) <= 50 || false;
      const elementY = Math.abs(el?.centerY - event.clientY) <= 50 || false;
      if (elementX && elementY) {
        return el;
      }
    });
    this.items$.value;
    return itemElement;
  }
}

import {
  Component,
  OnInit,
  ElementRef,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';

import {FORM_DIRECTIVES} from '@angular/common';

import {
  MessageService,
  ThreadService,
  UserService
} from '../../shared';

import { Observable } from 'rxjs/Observable';
import { User, Thread, Message, SocketService } from '../../shared';

import { ChatMessageComponent } from './chat-message.component';

@Component({
  selector: 'chat-window',
  directives: [ChatMessageComponent,
               FORM_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'app/+chat-container/+chat-window/chat-window.component.html',
  styleUrls: ['app/+chat-container/+chat-window/chat-window.component.css']
})
export class ChatWindowComponent implements OnInit {
  isPressEnter: boolean = true;
  messages: Observable<any>;
  currentThread: Thread;
  draftMessage: Message;
  currentUser: User;
  lastAuthor: User;
  @Input() parentHeight: number;

  constructor(private messageService: MessageService,
              private threadService: ThreadService,
              private userService: UserService,
              private socketService: SocketService,
              private el: ElementRef) {
  }

  ngOnInit(): void {
    console.log(this.parentHeight);
    // Calculate height of body box
    this.fixWindow();

    this.messages = this.threadService.currentThreadMessages;

    this.draftMessage = new Message();

    this.threadService.currentThread.subscribe(
      (thread: Thread) => {
        this.currentThread = thread;
      });

    this.userService.currentUser.subscribe((user) => {
      this.currentUser = new User(user);
    });

    this.messages
      .subscribe(
        (messages: Array<Message>) => {
          setTimeout(() => {
            this.scrollToBottom();
          });
        });

  }
  onEnter(event: any): void {
    if(!this.isPressEnter && !event.ctrlKey)
      return;
    this.sendMessage();
    event.preventDefault();
  }

  sendMessage(): void {
    let m: Message = this.draftMessage;
    m.author = this.currentUser;
    m.thread = this.currentThread;
    m.isRead = true;
    // this.messageService.addMessage(m);
    this.socketService.addMessage(m);
    this.draftMessage = new Message();
  }

  scrollToBottom(): void {
    // let scrollPane: any = this.el
    //   .nativeElement.querySelector('.msg-container-base');
    // scrollPane.scrollTop = scrollPane.scrollHeight;
  }

  updateLastAuthor(author: User): void {
    this.lastAuthor = author;
  }

  private fixWindow() {
    let elHeader = this.el.nativeElement.children[0].children[0];
    let elBody = this.el.nativeElement.children[0].children[1];
    let elFooter = this.el.nativeElement.children[0].children[2];

    let minHeight = this.parentHeight - (elHeader.offsetHeight + elFooter.offsetHeight + 70);      
    elBody.style.height = minHeight + 'px';
  }
}

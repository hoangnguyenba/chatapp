import { Component, OnInit, Input } from '@angular/core';
import { Router }  from '@angular/router';
import { NgClass } from '@angular/common';
import { Thread, ThreadService, MessageService, SocketService, Message, User, ChatUtilService } from '../../../shared/index';

@Component({
    moduleId: module.id,
    selector: 'chat-thread',
    templateUrl: 'chat-thread.component.html',
    styleUrls: ['chat-thread.component.css'],
    directives: [NgClass]
})
export class ChatThreadComponent implements OnInit {

    @Input() thread: Thread;
    selected: boolean = false;
    unreadMessagesCount: number;

    constructor(private router: Router,
                private threadService: ThreadService,
                private socketService: SocketService,
                private chatUtilService: ChatUtilService,
                private messageService: MessageService) {
    }

    ngOnInit(): void {

        this.threadService.currentThread
        .subscribe( (currentThread: Thread) => {
            this.selected = currentThread &&
            this.thread &&
            (currentThread.id === this.thread.id);
        });

        this.messageService.messages.subscribe(messages => {
            this.unreadMessagesCount =
            _.reduce(
                messages,
                (sum: number, m: Message) => {
                let messageIsInCurrentThread: boolean = m.thread &&
                    this.thread &&
                    (this.thread.id === m.thread.id);
                if (m && !m.isRead && messageIsInCurrentThread) {
                    sum = sum + 1;
                }
                return sum;
                },
                0);
        });
    }

    clicked(event: any): void {
        // Ask server to save: I've read this thread
        if(this.unreadMessagesCount > 0)
            this.socketService.markThreadAsRead(this.thread);

        this.threadService.setCurrentThread(this.thread);

        this.router.navigate(['/chat', this.thread.id.replace(':', '-')]);

        event.preventDefault();
    }

    status() {
        return {
            'text-green': this.thread.status === User.USER_STATUS_ONLINE,
            'text-yellow': this.thread.status === User.USER_STATUS_AWAY,
            'text-red': this.thread.status === User.USER_STATUS_BUSY,
        };
    }

}

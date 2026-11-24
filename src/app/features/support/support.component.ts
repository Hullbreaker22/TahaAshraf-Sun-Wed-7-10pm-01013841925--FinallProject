import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FaqItem {
  id: string;
  category: 'Orders' | 'Shipping' | 'Returns' | 'Payments';
  question: string;
  answer: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './support.component.html',
})
export class SupportComponent {
  private readonly fb = inject(FormBuilder);

  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  openFaqId = signal<string | null>('order-track');
  submittedTicketId = signal<string | null>(null);

  categories = ['All', 'Orders', 'Shipping', 'Returns', 'Payments'];

  faqs: FaqItem[] = [
    {
      id: 'order-track',
      category: 'Orders',
      question: 'How can I track my FreshCart order status?',
      answer:
        'Once your order is confirmed, you can monitor every step—from packing fresh items to courier dispatch—inside your Orders section.',
    },
    {
      id: 'shipping-time',
      category: 'Shipping',
      question: 'What are the delivery windows and same-day options?',
      answer:
        'Same-day and scheduled slots are available depending on your address and stock availability, with live updates before arrival.',
    },
    {
      id: 'return-policy',
      category: 'Returns',
      question: 'What if an item arrives damaged or not quite fresh?',
      answer:
        'Reach out right away with your order reference and item details; we prioritize quick replacements or refunds on fresh and damaged items.',
    },
    {
      id: 'payment-methods',
      category: 'Payments',
      question: 'Which payment methods are supported at checkout?',
      answer:
        'You can complete checkout using supported cards or cash on delivery depending on your region and order eligibility.',
    },
  ];

  filteredFaqs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();

    return this.faqs.filter((item) => {
      const matchesCategory = cat === 'All' || item.category === cat;
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  });

  supportForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    orderId: [''],
    topic: ['Order Issue', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  toggleFaq(id: string): void {
    this.openFaqId.set(this.openFaqId() === id ? null : id);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  submitSupportTicket(): void {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    const fakeTicket = `FC-${Math.floor(100000 + Math.random() * 900000)}`;
    this.submittedTicketId.set(fakeTicket);

    this.supportForm.reset({
      fullName: '',
      email: '',
      orderId: '',
      topic: 'Order Issue',
      message: '',
    });
  }

  hasError(controlName: keyof typeof this.supportForm.controls, errorName: string): boolean {
    const ctrl = this.supportForm.controls[controlName];
    return Boolean(ctrl.touched && ctrl.hasError(errorName));
  }
}
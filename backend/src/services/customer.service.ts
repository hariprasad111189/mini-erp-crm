import { NotFoundError } from "../errors/app-error";
import { customerRepository } from "../repositories/customer.repository";
import { paged } from "../utils/pagination";

type ListCustomersInput = {
  page: number;
  pageSize: number;
  search?: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
};

export class CustomerService {
  async list(input: ListCustomersInput) {
    const { data, total } = await customerRepository.list(input);
    return paged(data, total, input.page, input.pageSize);
  }

  async getById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError("Customer not found");
    return customer;
  }

  create(input: Parameters<typeof customerRepository.create>[0]) {
    return customerRepository.create(input);
  }

  async update(id: string, input: Parameters<typeof customerRepository.update>[1]) {
    await this.getById(id);
    return customerRepository.update(id, input);
  }

  async addFollowUp(customerId: string, authorId: string, note: string) {
    await this.getById(customerId);
    return customerRepository.addFollowUp(customerId, authorId, note);
  }
}

export const customerService = new CustomerService();


import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getRoot(): { status: string } {
    return { status: "Apartment Tracker API is running" };
  }
}

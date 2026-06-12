import { PaymentService } from '../services/PaymentService.js';
import { PaymentController } from '../controller/PaymentController.js';

/**
 * DI Container for the Payment module.
 */
class Container {
    static init() {
        const services = {
            paymentService: new PaymentService(),
        };

        const controller = {
            paymentController: new PaymentController(services.paymentService),
        };

        return { services, controller };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;

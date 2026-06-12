import clientRepository from '../repository/ClientRepository.js';
import { ClientService } from '../services/clientService.js';
import { ClientController } from '../controller/clientController.js';

/**
 * DI Container for the Client module.
 * Wires together repository, service, and controller.
 */
class Container {
    static init() {
        const repositories = { clientRepository };

        const services = {
            clientServices: new ClientService(clientRepository),
        };

        const controllers = {
            clientController: new ClientController(services.clientServices),
        };

        return { repositories, services, controllers };
    }
}

const initialized = Container.init();
export { Container };
export default initialized;

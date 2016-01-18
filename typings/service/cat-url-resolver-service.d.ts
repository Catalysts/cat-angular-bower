/**
 * Created by Mustafa on 05.08.2015.
 */
interface ICatUrlResolverService {
    getTabTemplate(tab: string, config: ICatDetailConfig): string;
}
declare class CatUrlResolverService implements ICatUrlResolverService {
    getTabTemplate(tab: string, config: ICatDetailConfig): string;
}

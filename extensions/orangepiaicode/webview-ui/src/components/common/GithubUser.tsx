import { FC } from 'react';
import { ExtensionMessage } from '../../../../src/shared/ExtensionMessage';
import { getVscExtensionPath } from '../../utils';


const GithubUser: FC<{ githubSession: ExtensionMessage['githubSession'] }> = ({ githubSession }) => {

	return <>
		<div className='font-medium text-[16px]'>
			{githubSession?.account.label || "User"}
		</div>
		<div className='h-[36px] w-[36px] rounded-full overflow-hidden'>
			{
				githubSession ? <img className='h-full w-full' src={`https://avatars.githubusercontent.com/u/${githubSession.account.id}`} alt="" />
					: <img className='h-full w-full' src={getVscExtensionPath("src/assets/default-avatar.png")} alt="" />
			}
		</div>
	</>
}

export default GithubUser;
